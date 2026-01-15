import API from "@/lib/axios-client";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";


export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();


    useEffect(() => {
        const code = searchParams.get("code");
        const workspace = searchParams.get("workspace");
        const status = searchParams.get("status");

        if (status === "failure") {
            navigate(`/l`)
            return;
        }

        if (!code) {
            navigate('/');
            return;
        }

        const exchangeCode = async () => {
            try {
                await API.post(`/auth/exchange-code`, { code });

                navigate(`/workspace/${workspace || ''}`);
            } catch (error) {
                console.error("Error exchanging code:", error);
                navigate("/")
            }
        }

        exchangeCode();

    }, [navigate, searchParams])


    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );

}