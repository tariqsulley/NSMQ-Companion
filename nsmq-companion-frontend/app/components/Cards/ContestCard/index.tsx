
interface ContestCardProps {
    contest_name: string;
    bg_color: string;
    border_colour: string;
    is_active: boolean
}

export default function ContestCard({ contest_name, bg_color, border_colour, is_active }: ContestCardProps) {
    return (
        <div>
            <div className=" border-[1px] "></div>
            <div className={`shadow m-5 p-4 bg-${bg_color}  border-l-2 border-l-${border_colour}`}>
                <p className="font-semibold">{contest_name} </p>
            </div>
            <div className=" border-[1px] "></div>
        </div>
    )
}

// bg-[#edf3fe] 
// bg-[#34a26e]