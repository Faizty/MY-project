"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ruler } from "lucide-react"

export default function SizeGuide({ category = "electronics" }) {
  const [open, setOpen] = useState(false)

  // Size guide data based on product category
  const sizeGuides = {
    electronics: {
      title: "Electronics Dimensions Guide",
      description: "Reference dimensions for various electronic devices",
      tabs: [
        {
          id: "smartphones",
          label: "Smartphones",
          content: (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Size</th>
                    <th className="p-2 text-left">Screen Size</th>
                    <th className="p-2 text-left">Dimensions (mm)</th>
                    <th className="p-2 text-left">Weight (g)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Compact</td>
                    <td className="p-2">5.0" - 5.5"</td>
                    <td className="p-2">~140 x 70 x 8</td>
                    <td className="p-2">140 - 160</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Standard</td>
                    <td className="p-2">5.6" - 6.1"</td>
                    <td className="p-2">~150 x 75 x 8</td>
                    <td className="p-2">160 - 180</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Large</td>
                    <td className="p-2">6.2" - 6.7"</td>
                    <td className="p-2">~165 x 80 x 8</td>
                    <td className="p-2">180 - 210</td>
                  </tr>
                  <tr>
                    <td className="p-2">Extra Large</td>
                    <td className="p-2">6.8" and above</td>
                    <td className="p-2">~175 x 85 x 8</td>
                    <td className="p-2">210+</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ),
        },
        {
          id: "laptops",
          label: "Laptops",
          content: (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Size</th>
                    <th className="p-2 text-left">Screen Size</th>
                    <th className="p-2 text-left">Dimensions (mm)</th>
                    <th className="p-2 text-left">Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Ultraportable</td>
                    <td className="p-2">11" - 13"</td>
                    <td className="p-2">~300 x 210 x 15</td>
                    <td className="p-2">0.9 - 1.3</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Thin & Light</td>
                    <td className="p-2">13" - 14"</td>
                    <td className="p-2">~320 x 220 x 18</td>
                    <td className="p-2">1.3 - 1.6</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Standard</td>
                    <td className="p-2">15" - 16"</td>
                    <td className="p-2">~360 x 240 x 20</td>
                    <td className="p-2">1.6 - 2.0</td>
                  </tr>
                  <tr>
                    <td className="p-2">Gaming/Workstation</td>
                    <td className="p-2">17" and above</td>
                    <td className="p-2">~400 x 280 x 25</td>
                    <td className="p-2">2.0+</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ),
        },
        {
          id: "wearables",
          label: "Wearables",
          content: (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Case Size (mm)</th>
                    <th className="p-2 text-left">Strap Width (mm)</th>
                    <th className="p-2 text-left">Weight (g)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">Small Smartwatch</td>
                    <td className="p-2">38 - 40</td>
                    <td className="p-2">18 - 20</td>
                    <td className="p-2">30 - 40</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Large Smartwatch</td>
                    <td className="p-2">42 - 46</td>
                    <td className="p-2">20 - 22</td>
                    <td className="p-2">40 - 60</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Fitness Tracker</td>
                    <td className="p-2">~20 x 10</td>
                    <td className="p-2">15 - 18</td>
                    <td className="p-2">20 - 30</td>
                  </tr>
                  <tr>
                    <td className="p-2">Sports Watch</td>
                    <td className="p-2">44 - 50</td>
                    <td className="p-2">22 - 24</td>
                    <td className="p-2">50 - 80</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ),
        },
      ],
    },
    // Add more categories as needed
  }

  // Get the appropriate guide based on category
  const guide = sizeGuides[category] || sizeGuides.electronics

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Ruler className="h-4 w-4" />
          <span>Size Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{guide.title}</DialogTitle>
          <DialogDescription>{guide.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={guide.tabs[0].id} className="mt-4">
          <TabsList className="w-full">
            {guide.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {guide.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Note: All measurements are approximate and may vary by manufacturer.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
