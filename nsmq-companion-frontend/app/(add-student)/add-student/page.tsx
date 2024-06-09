import Image from "next/image"
import map from "../../../public/images/bg.png";
import mapframe from "../../../public/images/asset-bg.svg";
import OnboardingNav from "@/app/components/OnboardingNav";
import AddStudentForm from "@/app/components/Forms/AddStudentForm";

export default function AddVehicle() {
    return (
        <div>
            <div className="flex flex-col  w-full">
                <div>
                    <OnboardingNav />
                </div>
                <div>
                    <div className="flex h-screen dark:bg-darkBgLight">
                        <div className="flex m-2  lg:m-0 flex-col w-full lg:w-2/5 items-center ">
                            <div className=" w-5/5 p-2 sm:p-0 sm:w-4/5  flex flex-col  h-screen">
                                <div className=" w-full">
                                    <AddStudentForm />
                                </div>
                            </div>
                        </div>
                        <div className={`hidden lg:inline fixed right-0 top-0 bottom-0 w-3/5`}>
                            <div className="absolute inset-0 z-10">
                                <Image
                                    className="w-full h-full object-cover opacity-30"
                                    src={map}
                                    layout="fill"
                                    alt="map"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}