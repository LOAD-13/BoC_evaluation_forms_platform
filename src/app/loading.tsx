import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <LoadingSpinner />
        </div>
    );
}