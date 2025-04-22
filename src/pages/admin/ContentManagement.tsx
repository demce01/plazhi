
import { ContentEditor } from "@/components/cms/ContentEditor";

export default function ContentManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">
          Edit website content and manage pages
        </p>
      </div>
      
      <ContentEditor />
    </div>
  );
}
