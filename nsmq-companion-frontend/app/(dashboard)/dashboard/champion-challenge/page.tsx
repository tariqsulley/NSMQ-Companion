
import Sidebar from "@/app/components/Sidebar"
export default function ChampionChallenge() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="bg-bgMain sm:ml-[256px] w-full">
                <div className="mt-[100px]">
                    <p>Do you have what it takes to be crowned grand champion of the national science and maths quiz?</p>
                    <p>Test your prowess against past champions</p>
                </div>
            </div>
        </div>
    )
}