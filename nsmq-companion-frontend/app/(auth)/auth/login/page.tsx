import Navbar from "@/app/components/Navbar"
import LoginForm from "@/app/components/Forms/LoginForm"

export default function Register() {
    return (
        <div className="bg-red-100  h-screen flex flex-col items-center justify-center">
            <div className="w-full relative top-0">
                <Navbar />
            </div>
            <div className="w-full flex flex-col items-center justify-center h-screen">
                <LoginForm />
            </div>
        </div>
    )
}