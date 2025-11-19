import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, BookOpen, Headphones, Heart, Brain } from "lucide-react";

interface Resource {
  title: string;
  description: string;
  url: string;
  category: string;
  icon: any;
}

const resources: Resource[] = [
  {
    title: "Headspace",
    description: "Guided meditation and mindfulness exercises",
    url: "https://www.headspace.com",
    category: "Meditation",
    icon: Headphones,
  },
  {
    title: "Calm",
    description: "Sleep stories, meditation, and relaxation",
    url: "https://www.calm.com",
    category: "Meditation",
    icon: Heart,
  },
  {
    title: "Study Tips by Khan Academy",
    description: "Effective study strategies and time management",
    url: "https://www.khanacademy.org/college-careers-more/study-skills",
    category: "Study Skills",
    icon: BookOpen,
  },
  {
    title: "Mental Health Foundation",
    description: "Information and support for mental wellness",
    url: "https://www.mentalhealth.org.uk",
    category: "Mental Health",
    icon: Brain,
  },
  {
    title: "Pomodoro Technique",
    description: "Time management method to boost productivity",
    url: "https://todoist.com/productivity-methods/pomodoro-technique",
    category: "Study Skills",
    icon: BookOpen,
  },
];

interface ResourceLibraryProps {
  stressFactors?: string[];
}

export default function ResourceLibrary({ stressFactors = [] }: ResourceLibraryProps) {
  const getRecommendedResources = () => {
    if (stressFactors.length === 0) return resources;

    const factors = stressFactors.join(" ").toLowerCase();
    const recommended: Resource[] = [];

    if (factors.includes("exam") || factors.includes("study") || factors.includes("academic")) {
      recommended.push(...resources.filter(r => r.category === "Study Skills"));
    }
    if (factors.includes("anxiety") || factors.includes("worry") || factors.includes("stress")) {
      recommended.push(...resources.filter(r => r.category === "Meditation"));
    }
    if (factors.includes("mental") || factors.includes("depression") || factors.includes("overwhelm")) {
      recommended.push(...resources.filter(r => r.category === "Mental Health"));
    }

    return recommended.length > 0 ? recommended : resources;
  };

  const displayResources = getRecommendedResources();

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle>Wellness Resources</CardTitle>
        <CardDescription>
          {stressFactors.length > 0
            ? "Recommended resources based on your stress factors"
            : "Helpful resources for stress management and wellness"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayResources.map((resource, idx) => {
            const Icon = resource.icon;
            return (
              <a
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors group"
              >
                <div className="p-2 rounded-md bg-primary/10 shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {resource.title}
                    </h4>
                    <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                </div>
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
