import * as z from 'zod';


export const formSchema = z.object({
  message: z.string().min(2, "Your message is too short!"),
});