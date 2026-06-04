import { Space_Grotesk, Inter } from "next/font/google";
import './edubot.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: 'EduBot AI — Smart 3D Teacher',
  description:
    'AI-powered voice teacher for Indian students. Learn any NCERT subject in your language with an animated 3D teacher, quiz mode, notes generator, and concept graph.',
  keywords: 'AI teacher, Indian education, NCERT, voice learning, Hindi tutor, JEE NEET preparation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <div className="edubot-root">
          {/* Ambient background orbs */}
          <div className="orb orb-teal" />
          <div className="orb orb-saffron" />
          <div className="orb orb-purple" />
          {children}
        </div>
      </body>
    </html>
  );
}
