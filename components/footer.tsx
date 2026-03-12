import Link from "next/link";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
                <BookOpen className="h-6 w-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Dr. Amankumar Srivastav</p>
                <p className="text-xs text-sidebar-foreground/70">Pvt Tutorials</p>
              </div>
            </div>
            <p className="text-sm text-sidebar-foreground/80 max-w-md leading-relaxed">
              Master NCERT Biology for NEET with structured practice, previous year questions, 
              mock tests, and performance analytics. Your success is our mission.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/practice" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Chapter Practice
                </Link>
              </li>
              <li>
                <Link href="/mock-test" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Mock Tests
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Student Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-sidebar-foreground/70">
                <Mail className="h-4 w-4" />
                mail
              </li>
              <li className="flex items-center gap-2 text-sidebar-foreground/70">
                <Phone className="h-4 w-4" />
                +91 9004811546
              </li>
              <li className="flex items-start gap-2 text-sidebar-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-8 pt-8 text-center text-sm text-sidebar-foreground/60">
          <p>&copy; {new Date().getFullYear()} Dr. Amankumar Srivastav Pvt Tutorials. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
