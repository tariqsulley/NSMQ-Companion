import Sidebar from "@/app/components/Sidebar"
import DashboardView from "@/app/components/Views/DashboardView"

export default function Dashboard() {
    return (
        <div className="flex min-h-screen ">
            <Sidebar />
            <div className="bg-bgMain  dark:bg-darkBgLight sm:ml-[256px] w-full flex flex-col flex-grow items-center ">
                <div className="w-11/12 mt-[100px] mb-2">
                    <DashboardView />
                </div>
            </div>
        </div>
    )
}