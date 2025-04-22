
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface ContentSection {
  id: string;
  key: string;
  title: string;
  content: string;
  section: string;
}

export function ContentEditor() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("homepage");
  
  // This would be populated from Supabase in a real implementation
  const [contentSections, setContentSections] = useState<ContentSection[]>([
    {
      id: "1",
      key: "hero_title",
      title: "Hero Title",
      content: "Your Perfect Beach Day Starts Here",
      section: "homepage"
    },
    {
      id: "2",
      key: "hero_subtitle",
      title: "Hero Subtitle",
      content: "Easily reserve beach umbrellas and chairs at your favorite beaches. Experience hassle-free beach days with BeachEase's simple booking system.",
      section: "homepage"
    },
    {
      id: "3",
      key: "how_it_works_title",
      title: "How It Works Title",
      content: "How It Works",
      section: "homepage"
    },
    {
      id: "4",
      key: "featured_beaches_title",
      title: "Featured Beaches Title",
      content: "Featured Beaches",
      section: "homepage"
    },
    {
      id: "5",
      key: "about_title",
      title: "About Title",
      content: "About BeachEase",
      section: "about"
    },
    {
      id: "6",
      key: "about_content",
      title: "About Content",
      content: "BeachEase is a modern beach reservation service designed to make your beach day perfect. We offer easy reservation of umbrellas and chairs at the most beautiful beaches.",
      section: "about"
    }
  ]);

  const handleContentChange = (id: string, newContent: string) => {
    setContentSections(prev => 
      prev.map(section => 
        section.id === id ? { ...section, content: newContent } : section
      )
    );
  };

  const saveChanges = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would save to Supabase
      // const { error } = await supabase
      //   .from('content_sections')
      //   .upsert(contentSections);
      
      // if (error) throw error;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Content updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error saving content",
        description: "An error occurred while saving your changes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSections = contentSections.filter(section => section.section === activeTab);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Content</CardTitle>
        <CardDescription>
          Edit the content that appears on your website
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="homepage" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="homepage">Homepage</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-6">
            {filteredSections.map(section => (
              <div key={section.id} className="space-y-2">
                <Label htmlFor={section.key}>{section.title}</Label>
                {section.content.length > 100 ? (
                  <Textarea
                    id={section.key}
                    value={section.content}
                    onChange={(e) => handleContentChange(section.id, e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                ) : (
                  <Input
                    id={section.key}
                    value={section.content}
                    onChange={(e) => handleContentChange(section.id, e.target.value)}
                  />
                )}
              </div>
            ))}
            
            <Button onClick={saveChanges} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
