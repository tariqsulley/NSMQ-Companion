import Sidebar from "@/app/components/Sidebar"
export default function AnalyticsPage() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="bg-bgMain sm:ml-[256px] w-full">
                <p className="mt-[100px]"> Analytics Page</p>
            </div>
        </div>
    )
}