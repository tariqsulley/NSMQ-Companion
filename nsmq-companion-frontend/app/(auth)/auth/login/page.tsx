import Navbar from "@/app/components/Navbar"
import LoginForm from "@/app/components/Forms/LoginForm"

export default function Register() {
    return (
        <div className=" h-screen flex flex-col items-center justify-center">
            <div className="w-full bg-blue-800 h-[12px] fixed top-0 z-50">

            </div>
            <div className="w-full flex flex-col items-center justify-center h-screen">
                <LoginForm />
            </div>
        </div>
    )
}