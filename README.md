# NSMQ-Companion

The NSMQ Companion App 

# Backend

[![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://docs.python.org/3/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![OpenAPI](https://img.shields.io/badge/openapi-6BA539?style=for-the-badge&logo=openapi-initiative&logoColor=fff)](https://www.openapis.org/)
[![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)](https://swagger.io/)
[![Typed with: pydantic](https://img.shields.io/badge/typed%20with-pydantic-BA600F.svg?style=for-the-badge)](https://docs.pydantic.dev/)

Before setting up the backend, please make sure you have python and pip installed 
I also ommited the onnx file from github because of the large size so when you pull the code in /utils/tts_files of the backend, manually place the quizmistress.onnx there
To setup the backend locally, please make sure your python version is Python 3.11.9 in order to avoid any dependecy conflicts and have a hassle free setup.
After that, move into the backend folder (cd nsmq-companion-backend)
Before starting the server, you would have to install the requirements via
pip install -r requirements.txt
When all the dependecies have been installed, you can successfully start the server
The command used to start the server is uvicorn app.main:app --reload


# Frontend
[![React](https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white&style=for-the-badge)](https://react.dev/)
[![Next JS](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Typescript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=flat-square)](https://www.typescriptlang.org/docs/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-0F172A?&logo=tailwindcss)](https://tailwindcss.com/)

Before setting up the frontend, please make sure you have node js installed 
[Node JS](https://nodejs.org/en)

In order to setup the frontend, move into the frontend folder via cd nsmq-companion-frontend
You would have to install the required libraries before starting the frontend server via the command
npm install

When the installation is done, you start the frontend server via npm run dev
Note: If you want to use the backend you are hosting as the base url in the frontend, in app/utils/api.js, change uncomment the local host
url and comment the other address
Also, I hosted the frontend just to make it easier to test, if you happen to try logging in and it does not work, it probably
means the server I am hosting locally is down, hence you would have to use the backend base url.

NB: There was not enough time in the hackathon so I could not finish implementing the multiplayer feature so please if you click join waiting room and nothing happens, it is not
a bug :)
On the dashboard of a facil
Extra Notes: A bug I noticed late but I would advice you use an earpiece or headset when competing in a round to avoid the quiz mistress voice inteferring with the speech to text
Also if questions did not load for a round(kindly refresh the page and they would load)

Press the letter b on your keyboard to ring the bell or the grey icon
For the champion challenge, if you see there is no grey icon, it means the school got that question right so please don't prease b, just press next question
On the dashboard of the facilitator, a knn is utlised to determine students who are similar in abilities and their strengths and weakness(there needs to be student data,(practice sessions))
