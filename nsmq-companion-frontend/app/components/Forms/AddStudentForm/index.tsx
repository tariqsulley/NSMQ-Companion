"use client"
import { useState } from "react"
import {
    Select,
    SelectItem,
} from '@tremor/react';
import { TextInput } from '@tremor/react';
import { CgSpinner } from "react-icons/cg";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";


export default function AddStudentForm() {
    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [year, setYear] = useState<string>("")
    const [studentImage, setStudentImage] = useState<File | string>("")
    const [creatingStudent, setCreatingStundet] = useState<boolean>(false)
    const router = useRouter()

    const isFormValid = (): boolean => {
        return firstName !== "" && lastName !== "" && year !== "" && email !== "";
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        try {
            setCreatingStundet(true)
            const response = await axios.post(``,
                {
                    firstName: firstName,
                    lastName: lastName,
                    year: year,
                    email: email,
                    stundentImage: studentImage
                })
            console.log("res", response)
            toast.success("Asset Created Successfully!", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Slide,
            });
            router.push("/dashboard")
        } catch (e) {
            console.log(e)
            toast.error("Error Creating Student", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Slide,
            });
        } finally {
            setCreatingStundet(false)
        }
    }

    return (
        <div className="mt-[90px]">
            <p className="font-semibold">Add Student</p>
            <p className="text-[#6a6e73]">
                Provide us with a few more details to complete your setup
            </p>
            <div className="flex mt-4 items-center justify-between">
                <div className="">
                    <p className="text-[#354055]">First Name</p>
                    <TextInput
                        value={firstName}
                        placeholder="Enter student first name"
                        onValueChange={(value: string) => setFirstName(value)}
                    />
                </div>

                <div>
                    <p className="text-[#354055]">Last Name</p>
                    <TextInput
                        value={lastName}
                        placeholder="Enter student last name"
                        onValueChange={(value: string) => setLastName(value)}
                    />
                </div>
            </div>

            <div className="mt-2">
                <p className="text-[#354055]">Year</p>
                <Select
                    value={year}
                    onValueChange={setYear}
                    defaultValue="0"
                >
                    <SelectItem value="0">Year 1</SelectItem>
                    <SelectItem value="commercial">Year 2</SelectItem>
                    <SelectItem value="private">Year 3</SelectItem>
                </Select>
            </div>

            <div className="mt-4">
                <p className="text-[#354055]">Email</p>
                <TextInput
                    value={email}
                    placeholder="Enter student email"
                    onValueChange={(value: string) => setEmail(value)}
                />
            </div>

            <div className=" gap-4 flex flex-col md:flex-row mt-8 md:mt-8 justify-end mb-8 ">
                <div className="sm:order-first order-none">
                    <Link href={"/dashboard/students"}>
                        <button className="border-gray-300 w-full rounded-xl border-2 px-5 py-2 text-sm">
                            Cancel
                        </button>
                    </Link>
                </div>

                <div className="order-first">
                    {creatingStudent ? (
                        <button className="bg-primary border-2 bg-primaryBlue hover:opacity-80 rounded-xl  px-5 py-2  flex items-center justify-center w-full sm:w-auto">
                            <CgSpinner className="animate-spin text-white" size={20} />
                        </button>
                    ) : (
                        <button
                            disabled={!isFormValid()}
                            onClick={handleSubmit}
                            className={`border-2 hover:opacity-80 rounded-xl px-5 py-2 text-sm w-full sm:w-auto font-semibold ${isFormValid() ? 'bg-primaryBlue text-white' : 'bg-[#d0d5dd] text-white '}`}
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
;