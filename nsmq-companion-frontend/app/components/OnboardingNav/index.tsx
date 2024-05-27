import Image from "next/image";
import bulb from "../../../public/icons/bulb.svg";

function OnboardingNav() {

    return (
        <div className="fixed bg-white p-4 border-b-2 w-full z-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Image src={bulb} alt="bulb" />
                <p className="">Add A Student</p>
            </div>
        </div>
    );
}

export default OnboardingNav;
