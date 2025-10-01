import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Beaker } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <Beaker className="h-16 w-16 text-magic-purple mx-auto opacity-50" />
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="text-xl text-muted-foreground">This potion doesn't exist in our spellbook</p>
        <Link to="/">
          <Button className="magical-button">
            Return to Workshop
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
