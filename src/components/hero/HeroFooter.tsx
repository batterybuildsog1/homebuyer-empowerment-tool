
import { Link } from "react-router-dom";
import { Heading } from "@/components/ui/Heading";
import { ROUTES } from "@/utils/routes";

export const HeroFooter = () => {
  return (
    <footer className="bg-black/30 py-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Heading as="h3" size="sm" className="mb-4">Moneybucket.ai</Heading>
            <p className="text-gray-400 text-sm">
              Your financial planning companion for achieving homeownership
            </p>
          </div>
          <div>
            <Heading as="h3" size="sm" className="mb-4">Quick Links</Heading>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to={ROUTES.mortgage} className="hover:text-[#8b76e0]">Mortgage Calculator</Link></li>
              <li><Link to={ROUTES.goals} className="hover:text-[#8b76e0]">Financial Goals</Link></li>
              <li><Link to={ROUTES.dashboard} className="hover:text-[#8b76e0]">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <Heading as="h3" size="sm" className="mb-4">Contact</Heading>
            <p className="text-gray-400 text-sm">
              support@moneybucket.ai<br />
              (555) 123-4567
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-800 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Moneybucket.ai. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
