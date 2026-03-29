/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState, useCallback } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const API = "http://localhost:8000";

function DropZone({ label, onFile, file }: {
  label: string;
  onFile: (f: File) => void;
  file: File | null;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    multiple: false,
    onDrop: ([f]) => f && onFile(f),
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}`}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="space-y-2">
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="mx-auto max-h-48 rounded-lg object-contain"
          />
          <p className="text-sm text-muted-foreground">{file.name}</p>
        </div>
      ) : (
        <div className="space-y-2 text-muted-foreground">
          <div className="text-4xl">🖼️</div>
          <p className="font-medium">{label}</p>
          <p className="text-sm">Drop an image here or click to browse</p>
        </div>
      )}
    </div>
  );
}

function ImagePair({ before, after, afterLabel }: {
  before: File;
  after: string;
  afterLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="space-y-2">
        <Badge variant="outline">Before</Badge>
        <img src={URL.createObjectURL(before)} className="w-full rounded-lg object-contain max-h-64" />
      </div>
      <div className="space-y-2">
        <Badge variant="outline">{afterLabel}</Badge>
        <img src={after} className="w-full rounded-lg object-contain max-h-64" />
      </div>
    </div>
  );
}

export default function Home() {
  const [cover, setCover] = useState<File | null>(null);
  const [secret, setSecret] = useState<File | null>(null);
  const [stego, setStego] = useState<string | null>(null);
  const [stegoBlob, setStegoBlob] = useState<Blob | null>(null);

  const [stegoInput, setStegoInput] = useState<File | null>(null);
  const [recovered, setRecovered] = useState<string | null>(null);
  const [recoveredBlob, setRecoveredBlob] = useState<Blob | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEncode = async () => {
    if (!cover || !secret) return;
    setLoading(true); setError(null);
    try {
      const form = new FormData();
      form.append("cover", cover);
      form.append("secret", secret);
      const res = await fetch(`${API}/encode`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      setStegoBlob(blob);
      setStego(URL.createObjectURL(blob));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = async () => {
    if (!stegoInput) return;
    setLoading(true); setError(null);
    try {
      const form = new FormData();
      form.append("stego", stegoInput);
      const res = await fetch(`${API}/decode`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      setRecoveredBlob(blob);
      setRecovered(URL.createObjectURL(blob));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const download = (blob: Blob, name: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">Image Steganography</h1>
            <ThemeToggle />
          </div>
          <p className="text-muted-foreground">Hide one image inside another — invisibly.</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Tabs defaultValue="encode">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode">Hide image</TabsTrigger>
            <TabsTrigger value="decode">Reveal image</TabsTrigger>
          </TabsList>

          {/* ENCODE TAB */}
          <TabsContent value="encode">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Hide a secret image inside a cover image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Cover image</p>
                    <DropZone label="Cover image" onFile={setCover} file={cover} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Secret image</p>
                    <DropZone label="Secret image" onFile={setSecret} file={secret} />
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={!cover || !secret || loading}
                  onClick={handleEncode}
                >
                  {loading ? "Processing..." : "Hide secret image"}
                </Button>

                {stego && cover && (
                  <>
                    <ImagePair before={cover} after={stego} afterLabel="Stego image" />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => stegoBlob && download(stegoBlob, "stego.png")}
                    >
                      Download stego image
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DECODE TAB */}
          <TabsContent value="decode">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Extract a hidden image from a stego image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Stego image</p>
                  <DropZone label="Stego image" onFile={setStegoInput} file={stegoInput} />
                </div>

                <Button
                  className="w-full"
                  disabled={!stegoInput || loading}
                  onClick={handleDecode}
                >
                  {loading ? "Extracting..." : "Reveal hidden image"}
                </Button>

                {recovered && stegoInput && (
                  <>
                    <ImagePair before={stegoInput} after={recovered} afterLabel="Recovered image" />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => recoveredBlob && download(recoveredBlob, "recovered.png")}
                    >
                      Download recovered image
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}