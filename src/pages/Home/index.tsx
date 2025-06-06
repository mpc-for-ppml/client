import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Batik from "@/assets/icons/batik.png";
import { ChevronRight, Shield, Users, Zap, Sparkles, FlaskConical } from 'lucide-react';
import { GearIcon } from '@radix-ui/react-icons';

export const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleExplore = async () => {
        navigate('/role');
    };

    const features = [
        {
            icon: <Shield className="w-5 h-5 text-blue-400" />,
            title: "Privacy-Preserving",
            description: "Train models without exposing raw data",
            iconBorder: "border-blue-400/30"
        },
        {
            icon: <Users className="w-5 h-5 text-purple-400" />,
            title: "Federated Learning",
            description: "Collaborate while keeping data distributed",
            iconBorder: "border-purple-400/30"
        },
        {
            icon: <Zap className="w-5 h-5 text-yellow-400" />,
            title: "Real-time Training",
            description: "Monitor progress with live updates",
            iconBorder: "border-yellow-400/30"
        }
    ];

    return (
        <div className="relative h-screen w-full bg-main-dark text-white overflow-hidden">
            {/* Made with love */}
            <div className="absolute md:left-[-17rem] left-[-19rem] top-1/2 md:-translate-y-1/2 -translate-y-2/3 rotate-90 pl-4 md:mt-16 flex items-center space-x-20">
                <span className="text-xs tracking-widest text-white/40 mr-[29rem]">MADE WITH LOVE</span>
                <div className="h-[65rem] w-px bg-white/40 rotate-90" />
            </div>

            {/* Background watermark text */}
            <motion.h1
                initial={{
                    opacity: 0,
                    x: -1200,
                }}
                animate={{
                    opacity: 1,
                    x: 0,
                }}
                transition={{
                    duration: 0.75,
                    ease: [0.4, 0.5, 0.2, 1],
                }}
                className="absolute text-[19rem] font-bold left-[-3.5rem] bottom-[-3rem] select-none pointer-events-none text-transparent"
                style={{
                    WebkitTextStroke: '0.5px #EAB12c80',
                }}
            >
                PRIVUS.
            </motion.h1>

            {/* Animated Blurry Bubbles */}
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: [0.3, 0.5, 0.3] }} 
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute -top-16 -right-20 w-[30rem] h-[30rem] bg-main-yellow rounded-full filter blur-[120px] opacity-50 z-0"
            />
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: [0.5, 0.7, 0.5] }} 
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute -top-80 right-72 w-[42rem] h-[38rem] bg-main-blue rounded-full filter blur-[120px] opacity-50 z-0"
            />

            {/* Content */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 200,
                }}
                animate={{
                    opacity: 1,
                    y: [50, -10, 0],
                }}
                transition={{
                    duration: 0.5,
                    ease: [0.4, 0.0, 0.2, 1],
                }}
                className="relative z-10 flex flex-col justify-center items-start h-full md:px-8 pl-20 max-w-7xl mx-auto mr-10"
            >
                {/* Logo */}
                <div className="flex space-x-2">
                    <img
                        src={Batik}
                        className="block h-16"
                        draggable="false"
                        alt=""
                    />
                </div>

                {/* Headline */}
                <h1 className="text-6xl md:text-7xl font-semibold leading-tight mt-6">
                    secure collaboration <br /> 
                    <span className="bg-gradient-to-r from-main-yellow to-main-blue bg-clip-text text-transparent">
                        made simple.
                    </span>
                </h1>

                {/* Subtitle */}
                <div className="text-lg text-white/50 space-x-6 mt-3 flex items-center">
                    <span>Tugas Akhir</span>
                    <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                    <span>Michael Leon Putra Widhi</span>
                    <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                    <span>13521108</span>
                </div>

                {/* CTA Button */}
                <motion.button 
                    onClick={handleExplore} 
                    className="group flex items-center bg-gradient-to-r from-main-blue to-main-blue/80 hover:from-main-blue/90 hover:to-main-blue/70 text-white rounded-xl px-8 pr-7 py-3 transition-all duration-300 font-semibold shadow-lg shadow-main-blue/20 mt-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Training
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>

            </motion.div>

            {/* Floating Feature Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="absolute top-16 right-20 z-20 group"
            >
                <Card className={`bg-white/15 border border-white/20 backdrop-blur-md hover:shadow-xl transition-all duration-300 rounded-2xl hover:rounded-3xl w-64`}>
                    <CardContent className="p-4">
                        <div className={`p-2 bg-black/20 rounded-lg inline-block mb-3 border ${features[0].iconBorder}`}>
                            {features[0].icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-1 text-white">{features[0].title}</h3>
                        <p className="text-white/80 text-sm">{features[0].description}</p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                className="absolute bottom-44 md:right-32 right-16 z-20 group"
            >
                <Card className={`bg-white/15 border border-white/20 backdrop-blur-md hover:shadow-xl transition-all duration-300 rounded-2xl hover:rounded-3xl w-64`}>
                    <CardContent className="p-4">
                        <div className={`p-2 bg-black/20 rounded-lg inline-block mb-3 border ${features[1].iconBorder}`}>
                            {features[1].icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-1 text-white">{features[1].title}</h3>
                        <p className="text-white/80 text-sm">{features[1].description}</p>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                className="absolute bottom-12 md:right-[18rem] right-[12rem] transform z-20 group"
            >
                <Card className={`bg-white/5 border border-white/20 backdrop-blur-md hover:shadow-xl transition-all duration-300 rounded-2xl hover:rounded-3xl`}>
                    <CardContent className="p-4 bg-gradient-to-br from-main-blue/20 to-main-yellow/20 rounded-2xl">
                        <FlaskConical className="w-8 h-8 text-primary text-white" />
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                whileHover={{ scale: 1.05 }}
                className="absolute top-24 right-[25rem] transform z-20 group"
            >
                <Card className={`bg-white/5 border border-white/20 backdrop-blur-md hover:shadow-xl transition-all duration-300 rounded-2xl hover:rounded-3xl`}>
                    <CardContent className="p-4 bg-gradient-to-br from-main-blue/20 to-main-yellow/20 rounded-2xl">
                        <GearIcon className="w-10 h-10 text-primary text-white" />
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className="absolute bottom-16 md:right-[27rem] right-[24rem] transform z-20 group"
            >
                <Card className={`bg-white/15 border border-white/20 backdrop-blur-md hover:shadow-xl transition-all duration-300 rounded-2xl hover:rounded-3xl w-64`}>
                    <CardContent className="p-4">
                        <div className={`p-2 bg-black/20 rounded-lg inline-block mb-3 border ${features[2].iconBorder}`}>
                            {features[2].icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-1 text-white">{features[2].title}</h3>
                        <p className="text-white/80 text-sm">{features[2].description}</p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
