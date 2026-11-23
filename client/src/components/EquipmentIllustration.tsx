import React from 'react';
import { EquipmentCategory, Department } from '../types/index.js';

interface EquipmentIllustrationProps {
  category: EquipmentCategory | string;
  department?: Department | string;
  className?: string;
}

export const EquipmentIllustration: React.FC<EquipmentIllustrationProps> = ({
  category,
  department,
  className = '',
}) => {
  // Department color accent palettes
  const getDeptGradients = (dept?: string) => {
    switch (dept) {
      case 'AI & ML':
        return {
          primary: '#0d9488', // teal-600
          secondary: '#06b6d4', // cyan-500
          accent: '#14b8a6', // teal-500
          bgLight: 'from-teal-500/10 via-cyan-500/5 to-slate-100',
          bgDark: 'dark:from-teal-950/40 dark:via-cyan-950/20 dark:to-slate-900',
        };
      case 'Computer Science':
        return {
          primary: '#2563eb', // blue-600
          secondary: '#38bdf8', // sky-400
          accent: '#60a5fa', // blue-400
          bgLight: 'from-blue-500/10 via-indigo-500/5 to-slate-100',
          bgDark: 'dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900',
        };
      case 'Electronics & ECE':
        return {
          primary: '#4f46e5', // indigo-600
          secondary: '#818cf8', // indigo-400
          accent: '#a855f7', // purple-500
          bgLight: 'from-indigo-500/10 via-purple-500/5 to-slate-100',
          bgDark: 'dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900',
        };
      case 'Mechanical':
        return {
          primary: '#d97706', // amber-600
          secondary: '#f59e0b', // amber-500
          accent: '#fbbf24', // amber-400
          bgLight: 'from-amber-500/10 via-orange-500/5 to-slate-100',
          bgDark: 'dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
        };
      case 'Robotics':
        return {
          primary: '#e11d48', // rose-600
          secondary: '#f43f5e', // rose-500
          accent: '#fb7185', // rose-400
          bgLight: 'from-rose-500/10 via-pink-500/5 to-slate-100',
          bgDark: 'dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
        };
      default:
        return {
          primary: '#0d9488',
          secondary: '#06b6d4',
          accent: '#14b8a6',
          bgLight: 'from-teal-500/10 via-slate-100 to-slate-100',
          bgDark: 'dark:from-slate-800 dark:via-slate-900 dark:to-slate-950',
        };
    }
  };

  const colors = getDeptGradients(department);

  const renderVectorGraphic = () => {
    switch (category) {
      case 'High-Performance Compute':
        // GPU Workstation / Server Rack with Heatsink & Fans
        return (
          <svg viewBox="0 0 240 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Server Case Body */}
            <rect x="25" y="20" width="190" height="60" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <rect x="35" y="28" width="170" height="44" rx="4" fill="#0f172a" />
            {/* Ventilation Fins */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <line key={i} x1={45 + i * 8} y1="34" x2={45 + i * 8} y2="66" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            ))}
            {/* Dual High-Performance Fans */}
            <circle cx="135" cy="50" r="16" fill="#1e293b" stroke={colors.secondary} strokeWidth="1.5" />
            <circle cx="135" cy="50" r="6" fill={colors.primary} />
            <circle cx="175" cy="50" r="16" fill="#1e293b" stroke={colors.secondary} strokeWidth="1.5" />
            <circle cx="175" cy="50" r="6" fill={colors.primary} />
            {/* Fan Blades (Decorative) */}
            <path d="M135 38 L135 44 M135 56 L135 62 M123 50 L129 50 M141 50 L147 50" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M175 38 L175 44 M175 56 L175 62 M163 50 L169 50 M181 50 L187 50" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" />
            {/* PCIe Gold Fingers & Status LEDs */}
            <rect x="40" y="80" width="80" height="4" rx="1" fill="#eab308" />
            <circle cx="195" cy="36" r="2.5" fill="#10b981" />
            <circle cx="195" cy="44" r="2.5" fill={colors.accent} />
            <circle cx="195" cy="52" r="2.5" fill="#38bdf8" />
          </svg>
        );

      case 'Edge AI & Embedded':
        // NVIDIA Jetson / Edge AI SoC Module
        return (
          <svg viewBox="0 0 240 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* PCB Base */}
            <rect x="40" y="16" width="160" height="68" rx="6" fill="#064e3b" stroke="#047857" strokeWidth="2" />
            {/* Mounting Holes */}
            <circle cx="48" cy="24" r="3" fill="#0f172a" stroke="#d1fae5" strokeWidth="1" />
            <circle cx="192" cy="24" r="3" fill="#0f172a" stroke="#d1fae5" strokeWidth="1" />
            <circle cx="48" cy="76" r="3" fill="#0f172a" stroke="#d1fae5" strokeWidth="1" />
            <circle cx="192" cy="76" r="3" fill="#0f172a" stroke="#d1fae5" strokeWidth="1" />
            {/* SoC Heatsink Center */}
            <rect x="85" y="26" width="70" height="48" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {/* Heatsink Fins */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="93" y1={33 + i * 8} x2="147" y2={33 + i * 8} stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            ))}
            <rect x="105" y="40" width="30" height="20" rx="3" fill={colors.primary} opacity="0.8" />
            <text x="120" y="54" fontSize="8" fontWeight="bold" fill="#ffffff" textAnchor="middle" fontFamily="monospace">AI CORE</text>
            {/* GPIO Header & Edge Connectors */}
            <rect x="42" y="34" width="12" height="32" rx="2" fill="#0f172a" />
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} cx="48" cy={40 + i * 7} r="1.5" fill="#facc15" />
            ))}
            {/* USB-C / HDMI Ports */}
            <rect x="165" y="35" width="28" height="14" rx="2" fill="#94a3b8" />
            <rect x="168" y="55" width="25" height="10" rx="2" fill="#94a3b8" />
          </svg>
        );

      case 'Testing & Measurement':
        // Digital Phosphor Oscilloscope with Live Waveform
        return (
          <svg viewBox="0 0 240 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Oscilloscope Chassis */}
            <rect x="30" y="15" width="180" height="70" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            {/* Screen Bezel */}
            <rect x="42" y="24" width="105" height="52" rx="4" fill="#020617" stroke="#334155" strokeWidth="1.5" />
            {/* CRT Grid */}
            <line x1="42" y1="50" x2="147" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="94" y1="24" x2="94" y2="76" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            {/* Live Sine/CAN Waveform */}
            <path
              d="M45 50 Q 55 28, 65 50 T 85 50 T 105 50 T 125 50 T 144 50"
              fill="none"
              stroke={colors.secondary}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Control Knobs & BNC Probes */}
            <circle cx="165" cy="38" r="8" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="188" cy="38" r="8" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="165" cy="62" r="5" fill="#0f172a" stroke={colors.primary} strokeWidth="1.5" />
            <circle cx="188" cy="62" r="5" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />
            {/* Power LED */}
            <circle cx="48" cy="20" r="2" fill="#10b981" />
          </svg>
        );

      case 'Rapid Prototyping':
      case 'Fabrication & CNC':
        // High-Precision 3D Printer / CNC Toolhead
        return (
          <svg viewBox="0 0 240 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Frame Gantry */}
            <rect x="45" y="16" width="150" height="68" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            {/* Z-Axis Linear Rails */}
            <line x1="65" y1="20" x2="65" y2="76" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
            <line x1="175" y1="20" x2="175" y2="76" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
            {/* X-Axis Crossbar */}
            <rect x="60" y="38" width="120" height="6" rx="2" fill="#475569" />
            {/* Extruder Printhead Assembly */}
            <rect x="110" y="32" width="20" height="22" rx="3" fill="#1e293b" stroke={colors.primary} strokeWidth="1.5" />
            <path d="M117 54 L123 54 L120 60 Z" fill="#f59e0b" />
            {/* Heated Print Bed */}
            <rect x="80" y="70" width="80" height="8" rx="2" fill="#1e293b" stroke={colors.secondary} strokeWidth="1" />
            {/* 3D Printed Prototype Model */}
            <path d="M113 70 L113 62 L127 62 L127 70 Z" fill={colors.accent} opacity="0.9" />
            {/* Laser / Extrusion Beam */}
            <line x1="120" y1="60" x2="120" y2="62" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="1 1" />
          </svg>
        );

      case 'FPGA & VLSI':
        // Xilinx / Intel FPGA Development Kit with BGA Array & LEDs
        return (
          <svg viewBox="0 0 240 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Dark Silicon Substrate */}
            <rect x="40" y="15" width="160" height="70" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
            {/* Circuit Traces */}
            <path d="M50 30 H75 V45 H90" stroke="#334155" strokeWidth="1.5" />
            <path d="M50 70 H75 V55 H90" stroke="#334155" strokeWidth="1.5" />
            <path d="M190 30 H165 V45 H150" stroke="#334155" strokeWidth="1.5" />
            <path d="M190 70 H165 V55 H150" stroke="#334155" strokeWidth="1.5" />
            {/* FPGA BGA Chip Package */}
            <rect x="90" y="25" width="60" height="50" rx="4" fill="#1e293b" stroke={colors.primary} strokeWidth="2" />
            <rect x="100" y="35" width="40" height="30" rx="2" fill="#020617" />
            <text x="120" y="52" fontSize="9" fontWeight="bold" fill={colors.secondary} textAnchor="middle" fontFamily="monospace">FPGA</text>
            <text x="120" y="60" fontSize="6" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">VLSI 7nm</text>
            {/* Logic Analyzer / DIP Switch Matrix */}
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={50 + i * 7} y="44" width="4" height="12" rx="1" fill={i % 2 === 0 ? colors.accent : '#334155'} />
            ))}
            {/* High-Speed Quad SFP Ports */}
            <rect x="165" y="38" width="22" height="24" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
            <circle cx="172" cy="50" r="3" fill="#020617" />
            <circle cx="180" cy="50" r="3" fill="#020617" />
          </svg>
        );

      case 'Autonomous Systems':
      case 'Robotics & Automation':
        // LiDAR / Robotic Sensor Platform & Articulated Arm
        return (
          <svg viewBox="0 0 240 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Mobile Robot Chassis */}
            <rect x="55" y="52" width="130" height="26" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            {/* Wheels / Tracks */}
            <circle cx="75" cy="78" r="9" fill="#0f172a" stroke="#64748b" strokeWidth="2.5" />
            <circle cx="115" cy="78" r="9" fill="#0f172a" stroke="#64748b" strokeWidth="2.5" />
            <circle cx="165" cy="78" r="9" fill="#0f172a" stroke="#64748b" strokeWidth="2.5" />
            {/* 360-Degree LiDAR Turret */}
            <rect x="100" y="38" width="40" height="14" rx="3" fill="#334155" />
            <rect x="105" y="24" width="30" height="14" rx="7" fill="#0f172a" stroke={colors.primary} strokeWidth="1.5" />
            {/* LiDAR Scanning Rays (Cone of vision) */}
            <path d="M120 24 L85 10 M120 24 L120 6 M120 24 L155 10" stroke={colors.secondary} strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />
            {/* Articulated Servo Joint */}
            <circle cx="75" cy="48" r="5" fill={colors.accent} />
            <line x1="75" y1="48" x2="60" y2="30" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
            <circle cx="60" cy="30" r="4" fill="#334155" />
          </svg>
        );

      case 'IoT & Sensors':
      default:
        // Multi-Sensor Suite / Microcontroller Node
        return (
          <svg viewBox="0 0 240 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sensor Carrier Board */}
            <rect x="45" y="18" width="150" height="64" rx="6" fill="#064e3b" stroke="#047857" strokeWidth="2" />
            {/* Wireless Antenna Trace */}
            <path d="M55 25 H70 V35 H60 V45 H70" stroke="#facc15" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Sensor Transducers */}
            <circle cx="105" cy="50" r="14" fill="#1e293b" stroke={colors.primary} strokeWidth="2" />
            <circle cx="105" cy="50" r="7" fill={colors.secondary} />
            {/* Environmental Sensor Chamber (BME680) */}
            <rect x="135" y="38" width="22" height="22" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="146" cy="49" r="3" fill="#0f172a" />
            {/* I2C / SPI Pin Headers */}
            <rect x="175" y="30" width="8" height="40" rx="1" fill="#0f172a" />
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx="179" cy={35 + i * 7} r="1.5" fill="#facc15" />
            ))}
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative w-full h-24 sm:h-28 overflow-hidden bg-gradient-to-br ${colors.bgLight} ${colors.bgDark} flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80 ${className}`}
      aria-hidden="true"
    >
      {/* Subtle Blueprint Mesh Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '16px 16px',
        }}
      />
      {/* Decorative Glow Orb */}
      <div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-30 pointer-events-none"
        style={{ backgroundColor: colors.primary }}
      />
      {/* SVG Hardware Illustration */}
      <div className="relative z-10 w-full max-w-[240px] h-full flex items-center justify-center p-2 transition-transform duration-300 group-hover:scale-105">
        {renderVectorGraphic()}
      </div>
    </div>
  );
};
