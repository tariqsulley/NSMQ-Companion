import Sidebar from "@/app/components/Sidebar"
export default function StudentsPage() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="bg-bgMain sm:ml-[256px] w-full">
                <p className="mt-[100px]"> Students Page</p>
            </div>
        </div>
    )
}