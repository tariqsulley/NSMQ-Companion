import Sidebar from "@/app/components/Sidebar"
import AnalyticsView from "@/app/components/Views/AnalyticsView"

export default function AnalyticsPage() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="bg-bgMain sm:ml-[256px] w-full">
                <div className="mt-[100px]  w-full flex flex-col items-center ">
                    <AnalyticsView />
                </div>
            </div>
        </div>
    )
}