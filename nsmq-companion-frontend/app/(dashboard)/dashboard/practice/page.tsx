import Sidebar from "@/app/components/Sidebar"

export default function PracticePage() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="bg-bgMain sm:ml-[256px] w-full">
                <p className="mt-[100px]"> Test your understanding on NSMQ contests from the past</p>
                <div className="rounded-lg bg-white">
                    <p>2021</p>
                </div>
            </div>
        </div>
    )
}