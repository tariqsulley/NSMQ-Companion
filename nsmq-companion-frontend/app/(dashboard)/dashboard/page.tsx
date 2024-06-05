import Sidebar from "@/app/components/Sidebar"
import DashboardView from "@/app/components/Views/DashboardView"

export default function Dashboard() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="bg-bgMain dark:bg-darkBgLight sm:ml-[256px] w-full flex flex-col items-center">
                <div className="w-11/12">
                    <p className="mt-[100px]"> Welcome to the nsmq companion Dashboard</p>
                    <DashboardView />
                </div>
            </div>
        </div>
    )
}