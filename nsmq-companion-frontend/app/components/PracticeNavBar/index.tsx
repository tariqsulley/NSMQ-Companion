import Link from "next/link"
export default function PracticeNavBar() {
    return (
        <div className="bg-white dark:bg-darkBgDeep flex justify-evenly p-4 items-center w-full border-b-2">
            <div>
                <p> NSMQ Companion</p>
            </div>
            <div>
                <Link href={"/dashboard/practice"}>
                    <p className="font-semibold hover:underline">Dashboard</p>
                </Link>
            </div>
        </div>
    )
}