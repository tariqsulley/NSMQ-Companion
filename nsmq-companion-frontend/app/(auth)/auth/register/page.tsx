import RegisterForm from "@/app/components/Forms/RegisterForm"
import Navbar from "@/app/components/Navbar"

export default function Register() {
    return (
        <div className="bg-red-100  h-screen flex flex-col items-center justify-center">
            <div className="w-full fixed top-0">
                <Navbar />
            </div>
            <div className="w-full flex flex-col items-center justify-center h-screen mt-20">
                <RegisterForm />
            </div>
        </div>
    )
}