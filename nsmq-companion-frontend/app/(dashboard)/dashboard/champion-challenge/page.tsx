import Sidebar from "@/app/components/Sidebar"
import ChampionChallengeView from "@/app/components/Views/ChampionChallengeView"

export default function ChampionChallenge() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="bg-bgMain sm:ml-[256px] w-full flex flex-col items-center">
                <div className="mt-[100px] w-[95%] flex flex-col items-center justify-center">
                    <p>Do you have what it takes to be crowned grand champion of the national science and maths quiz?</p>
                    <p>Test your prowess against past champions</p>
                    <ChampionChallengeView />
                </div>
            </div>
        </div>
    )
}