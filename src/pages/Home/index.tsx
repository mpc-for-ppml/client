import React from 'react';
import { useNavigate } from 'react-router-dom';
import Batik from "@/assets/icons/batik.png";

export const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleExplore = async () => {
        navigate('/role');
    };

    return (
        <div className="relative min-h-screen w-full bg-main-dark text-white overflow-hidden">
            {/* Made with love */}
            <div className="absolute left-[-17rem] top-1/2 -translate-y-1/2 rotate-90 pl-4 mt-16 flex items-center space-x-20">
                <span className="text-xs tracking-widest text-white/40 mr-[29rem]">MADE WITH LOVE</span>
                <div className="h-[65rem] w-px bg-white/40 rotate-90" />
            </div>

            {/* Background watermark text */}
            <h1
                className="absolute text-[19rem] font-bold left-[-3.5rem] bottom-[-3rem] select-none pointer-events-none text-transparent"
                style={{
                    WebkitTextStroke: '0.5px #EAB12c80',
                }}
            >
                PRIVUS.
            </h1>

            {/* Blurry Bubbles */}
            <div className="absolute -top-16 -right-20 w-[30rem] h-[30rem] bg-main-yellow rounded-full filter blur-[120px] opacity-50 z-0"></div>
            <div className="absolute -top-80 right-72 w-[42rem] h-[38rem] bg-main-blue rounded-full filter blur-[120px] opacity-50 z-0"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center items-start h-full mt-28 px-8 max-w-6xl mx-auto">
                {/* Logo */}
                <div className="flex space-x-2">
                    <img
                        src={Batik}
                        className="block h-20"
                        draggable="false"
                        alt=""
                    />
                </div>

                {/* Headline */}
                <h1 className="text-6xl md:text-7xl font-semibold leading-tight mt-10">
                    secure collaboration <br /> made simple.
                </h1>

                {/* Subtitle */}
                <div className="text-xl font-thin text-white/50 space-x-8 mt-4">
                    <span>tugas</span>
                    <span>akhir</span>
                    <span>michael</span>
                    <span>leon</span>
                </div>
                <div className="text-xl text-white/50 space-x-8">
                    <span>putra</span>
                    <span>widhi</span>
                </div>

                {/* Explore Button */}
                <button onClick={handleExplore} className="border border-white text-white px-8 py-2 mt-10 rounded hover:bg-white hover:text-black transition">
                    Explore
                </button>
            </div>
        </div>
    );
};
