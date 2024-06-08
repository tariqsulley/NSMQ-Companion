import Sidebar from "@/app/components/Sidebar"
import SettingsView from "@/app/components/Views/SettingsView"

export default function SettingsPage() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="bg-bgMain sm:ml-[256px] w-full flex justify-center">
                <div className="mt-[100px]  w-11/12 ">
                    <SettingsView />
                </div>
            </div>
        </div>
    )
}