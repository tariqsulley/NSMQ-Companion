import Link from "next/link"

export default function PracticeNavBar() {
    return (
        <div className="bg-blue-800 dark:bg-darkBgDeep flex justify-evenly p-4 items-center w-full border-b-2">
            <div>
                <p className="text-white"> NSMQ Companion</p>
            </div>
            <div>
                <Link href={"/dashboard/practice"}>
                    <p className="text-white font-semibold hover:underline">Dashboard</p>
                </Link>
            </div>
        </div>
    )
}