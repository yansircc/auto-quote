"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { CADData } from "@/types/domain/product";
import { useState } from "react";

// Define Zod schema for CAD response data
const cadDataSchema = z.object({
  boundingBox: z.object({
    center: z.object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    }),
    dimensions: z.object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    }),
    rotation: z
      .object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      })
      .optional(),
  }),
  topology: z
    .object({
      vertices: z.number(),
      edges: z.number(),
      faces: z.number(),
      shells: z.number(),
    })
    .optional(),
  features: z
    .object({
      holes: z.number().optional(),
      ribs: z.number().optional(),
      bosses: z.number().optional(),
      fillets: z.number().optional(),
      chamfers: z.number().optional(),
    })
    .optional(),
  volume: z.number(),
  surfaceArea: z.number(),
  centerOfMass: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  momentOfInertia: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  format: z.string().optional(),
  version: z.string().optional(),
  lastModified: z.string().or(z.date()).optional(),
});

const formSchema = z.object({
  file: z
    .custom<File>((val) => val instanceof File, "Please upload a file")
    .refine((file) => {
      const validExtensions = [".step", ".stp", ".stl"];
      return validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext),
      );
    }, "Please upload a valid CAD file (STEP or STL)"),
});

type FormSchema = z.infer<typeof formSchema>;

export default function CADParserPage() {
  const [cadData, setCADData] = useState<CADData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormSchema) {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", values.file);

      const response = await fetch("/api/parse-cad", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse CAD file");
      }

      const rawData = (await response.json()) as unknown;

      // Validate and transform the response data
      const parsedData = cadDataSchema.safeParse(rawData);

      if (!parsedData.success) {
        throw new Error("Invalid CAD data format received from server");
      }

      setCADData(parsedData.data as CADData);
    } catch (error) {
      console.error("Error parsing CAD file:", error);
      setError(
        error instanceof Error ? error.message : "Failed to parse CAD file",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>CAD File Parser</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="file"
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Upload CAD File</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12">
                        <Input
                          type="file"
                          accept=".step,.stp,.stl"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                            }
                          }}
                          {...field}
                          className="max-w-sm"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          Drag and drop your CAD file here, or click to select
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Parsing..." : "Parse CAD File"}
              </Button>
            </form>
          </Form>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {cadData && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold">Parsed CAD Data:</h3>
              <pre className="mt-4 rounded-lg bg-gray-100 p-4">
                {JSON.stringify(cadData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
