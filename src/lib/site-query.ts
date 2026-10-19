import { queryOptions } from '@tanstack/react-query';
import { getSiteContent } from './site.functions';
export const siteQuery = queryOptions({queryKey:['site-content'],queryFn:()=>getSiteContent(),staleTime:60_000});
