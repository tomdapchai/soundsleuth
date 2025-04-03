"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { SignInSchema } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SignIn = () => {
    const { isAuthenticated, login } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    useEffect(() => {
        if (isAuthenticated) {
            router.replace("/");
        }
    }, [isAuthenticated, router]);

    const form = useForm<z.infer<typeof SignInSchema>>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof SignInSchema>) {
        // do validation here
        try {
            // encrypt password before sending
            /* await login(values.username, values.password).then((res) => {
                if (res.status === 'success') {
                    setisAuthenticatedSuccess(true);
                } else {
                    setisAuthenticatedSuccess(false);
                }
            }); */
            await login(values.username, values.password)
                .then((res) => {
                    if ("error" in res) {
                        toast({
                            title: "Login failed",
                            description: "Invalid credentials",
                            variant: "destructive",
                        });
                    } else {
                        toast({
                            title: "Login success",
                            description: "You have successfully logged in",
                            className: "bg-green-500 text-white border-none",
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });

            // router.push("/dashboard");
        } catch (error) {
            console.error(error);
            // suppose to display error message here (use toast)
        }
    }

    return (
        <Card className="w-[400px] h-fit">
            <CardHeader>
                <CardTitle className="text-sub">Sign In</CardTitle>
                <CardDescription>
                    Provide login credentials to sign you in
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex w-full flex-col gap-5">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem className="flex w-full flex-col">
                                    <FormLabel className="paragraph-semibold">
                                        Username
                                    </FormLabel>
                                    <FormControl className="mt-1">
                                        <Input
                                            className="no-focus border"
                                            placeholder="Enter your username here"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="flex w-full flex-col">
                                    <FormLabel className="paragraph-semibold">
                                        Password
                                    </FormLabel>
                                    <FormControl className="mt-1">
                                        <Input
                                            className="no-fcous border"
                                            placeholder="Enter your password here"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-500" />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">
                            Sign In
                        </Button>
                    </form>
                </Form>
            </CardContent>

            <CardFooter className="text-sm flex gap-2">
                <p className="text-slate-400">Haven't had account yet?</p>
                <Link
                    href={"/sign-up"}
                    className="underline text-sub hover:text-[#b88e2f]/80">
                    Sign Up
                </Link>
            </CardFooter>
        </Card>
    );
};

export default SignIn;
