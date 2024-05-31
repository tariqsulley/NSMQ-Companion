interface ContestCardProps {
    contest_name: string;
    bg_color: string;
    is_active: boolean;
    onClick: () => void;
}

export default function ContestCard({ contest_name, bg_color, is_active, onClick }: ContestCardProps) {
    return (
        <div onClick={onClick} className="w-1/2">
            <div className=" border-[1px] "></div>
            <div className={`shadow m-5 p-4 ${is_active ? `bg-[#edf3fe] border-l-[5px] border-l-[#1964f1]` : bg_color} `}>
                <p className="font-semibold">{contest_name} </p>
            </div>
            <div className=" border-[1px] "></div>
        </div>
    )
}