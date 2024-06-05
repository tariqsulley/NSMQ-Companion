"use client"
import { useAuth } from "@/app/context/AuthContext"
import EmptyDashboardCard from "@/app/components/Cards/EmptyCard/Dashboard"

export default function DashboardView() {
    const { Data } = useAuth()
    return (
        <div className="flex flex-col gap-2">
            <p className="text-xl font-semibold"> Good Evening, {Data?.data?.first_name}</p>
            <EmptyDashboardCard />
        </div>
    )
}