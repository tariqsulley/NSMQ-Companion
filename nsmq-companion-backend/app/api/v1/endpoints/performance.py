from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import ORJSONResponse
from app.schemas.performance import PerformanceCreate, PerformanceRead
from app.service.performance_service import PerformanceService
from app.core.container import Container
from app.utils.utils import send_data, send_internal_server_error
from typing import List
import pandas as pd
from sklearn.neighbors import NearestNeighbors

router = APIRouter(
    prefix="/performance",
    tags=["performance"],
)

@router.post("/", response_class=ORJSONResponse)
@inject
async def create_performance(performance: PerformanceCreate, 
                             performance_service: PerformanceService = Depends(Provide[Container.performance_service])):
    try:
        new_performance = performance_service.create_performance(performance)
        return send_data(new_performance)
    except Exception as e:
        return send_internal_server_error(user_msg="Error posting data", error=str(e))

@router.get("/student/{student_id}", response_model=List[PerformanceRead])
@inject
async def get_performance_by_student(student_id: str, 
                                     performance_service: PerformanceService = Depends(Provide[Container.performance_service])):
    try:
        performance_list = performance_service.get_performance_by_student(student_id)
        return performance_list
    except Exception as e:
        return send_internal_server_error(user_msg="Failed to retrieve performance data", error=str(e))

@router.get("/contest/{contest_id}", response_model=List[PerformanceRead])
@inject
async def get_performance_by_contest(contest_id: str, 
                                     performance_service: PerformanceService = Depends(Provide[Container.performance_service])):
    try:
        performance_list = performance_service.get_performance_by_contest(contest_id)
        return performance_list
    except Exception as e:
        return send_internal_server_error(user_msg="Failed to retrieve performance data", error=str(e))


@router.get("/recommendations/{student_id}", response_class=ORJSONResponse)
@inject
async def get_recommendations(student_id: str, 
                              performance_service: PerformanceService = Depends(Provide[Container.performance_service])):
    try:
        # Query all performance data
        all_performance_data = performance_service.get_all_performance()
        
        # Transform the data into a DataFrame
        data = []
        for performance in all_performance_data:
            data.append({
                'student_id': str(performance.student_id),
                'topic': performance.topic,
                'score': performance.score,
                'time_taken': performance.time_taken
            })
        df = pd.DataFrame(data)

        # Pivot the data to get a student-topic matrix
        student_score_matrix = df.pivot_table(index='student_id', columns='topic', values='score', fill_value=0)
        student_time_matrix = df.pivot_table(index='student_id', columns='topic', values='time_taken', fill_value=0)

        # Normalize time taken to a 0-1 range
        student_time_matrix = student_time_matrix.apply(lambda x: (x - x.min()) / (x.max() - x.min()), axis=0)

        # Combine the matrices by stacking them horizontally
        combined_matrix = pd.concat([student_score_matrix, student_time_matrix], axis=1)

        # Train the KNN model
        n_neighbors = min(3, combined_matrix.shape[0])
        model = NearestNeighbors(n_neighbors=n_neighbors, metric='cosine', algorithm='brute')
        model.fit(combined_matrix)

        # Get the performance vector for the specified student
        student_vector = combined_matrix.loc[student_id].values.reshape(1, -1)

        # Find similar students
        distances, indices = model.kneighbors(student_vector)
        similar_students = combined_matrix.iloc[indices[0]].index.tolist()

        # Get student names
        student_names = performance_service.get_student_names(similar_students)

        # Calculate average scores for each topic among similar students
        similar_students_data = student_score_matrix.loc[similar_students]
        average_scores = similar_students_data.mean().reset_index()
        average_scores.columns = ['topic', 'average_score']

        response_data = {
            "similar_students": [{"student_id": student_id, "student_name": student_names[student_id]} for student_id in similar_students],
            "topic_scores": average_scores.to_dict(orient="records")
        }

        return send_data(response_data)
    except Exception as e:
        return send_internal_server_error(user_msg="Failed to retrieve recommendations", error=str(e))

    