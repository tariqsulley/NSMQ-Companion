import Sidebar from "@/app/components/Sidebar"

import PracticeCardView from "@/app/components/CardViews/PracticeCardViews"
export default function PracticePage() {

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="bg-bgMain  dark:bg-darkBgLight sm:ml-[256px] w-full">
                <p className="mt-[100px] mx-4 mb-2 font-semibold text-xl">Revisit history and test your understanding on NSMQ contests from the past</p>
                <PracticeCardView />
            </div>
        </div>
    )
}
