import Sidebar from "@/app/components/Sidebar"
import StudentsTable from "@/app/components/Tables/StudentsTable"
export default function StudentsPage() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="bg-bgMain dark:bg-darkBgLight sm:ml-[256px] w-full flex justify-center">
                <StudentsTable />
            </div>
        </div>
    )
}