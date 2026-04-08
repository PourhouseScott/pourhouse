--
-- PostgreSQL database dump
--

\restrict gt2paxXa3xroEhve0m6IIsK1DdBJNYebhOHM9Zn2LCxfXEb8ULYuNB2jZxpQeG9

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AuthProvider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuthProvider" AS ENUM (
    'LOCAL',
    'GOOGLE'
);


ALTER TYPE public."AuthProvider" OWNER TO postgres;

--
-- Name: ServingMode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ServingMode" AS ENUM (
    'BOTTLE_750ML',
    'GLASS_5OZ',
    'GLASS_9OZ',
    'FLIGHT_2OZ',
    'UNKNOWN'
);


ALTER TYPE public."ServingMode" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Flight; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Flight" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Flight" OWNER TO postgres;

--
-- Name: FlightWine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FlightWine" (
    id text NOT NULL,
    "flightId" text NOT NULL,
    "wineId" text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."FlightWine" OWNER TO postgres;

--
-- Name: Inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Inventory" (
    id text NOT NULL,
    "locationId" text NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sealedBottleCount" integer NOT NULL,
    "wineId" text NOT NULL
);


ALTER TABLE public."Inventory" OWNER TO postgres;

--
-- Name: Rating; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Rating" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "wineId" text NOT NULL,
    rating integer NOT NULL,
    notes text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Rating" OWNER TO postgres;

--
-- Name: Region; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Region" (
    id text NOT NULL,
    name text NOT NULL,
    "parentId" text
);


ALTER TABLE public."Region" OWNER TO postgres;

--
-- Name: SquareCatalogItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SquareCatalogItem" (
    id text NOT NULL,
    "squareItemId" text NOT NULL,
    "wineId" text,
    "rawPayload" jsonb NOT NULL,
    "extractedData" jsonb NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "lastSyncedAt" timestamp(3) without time zone NOT NULL,
    "syncFailedAt" timestamp(3) without time zone,
    "syncError" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SquareCatalogItem" OWNER TO postgres;

--
-- Name: SquareCatalogVariation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SquareCatalogVariation" (
    id text NOT NULL,
    "squareVariationId" text NOT NULL,
    "squareCatalogItemId" text NOT NULL,
    "wineVariationId" text,
    "rawPayload" jsonb NOT NULL,
    "extractedData" jsonb NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "lastSyncedAt" timestamp(3) without time zone NOT NULL,
    "syncFailedAt" timestamp(3) without time zone,
    "syncError" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SquareCatalogVariation" OWNER TO postgres;

--
-- Name: SquareServingModeOverride; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SquareServingModeOverride" (
    id text NOT NULL,
    "squareVariationId" text NOT NULL,
    "servingMode" public."ServingMode" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SquareServingModeOverride" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "authProvider" public."AuthProvider" DEFAULT 'LOCAL'::public."AuthProvider" NOT NULL,
    "googleSubject" text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: Wine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Wine" (
    id text NOT NULL,
    name text NOT NULL,
    vintage integer NOT NULL,
    "wineryId" text NOT NULL,
    "regionId" text NOT NULL,
    country text NOT NULL,
    "grapeVarieties" jsonb NOT NULL,
    "alcoholPercent" double precision NOT NULL,
    description text NOT NULL,
    "imageUrl" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    slug text NOT NULL,
    "squareItemId" text
);


ALTER TABLE public."Wine" OWNER TO postgres;

--
-- Name: WineVariation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WineVariation" (
    id text NOT NULL,
    "wineId" text NOT NULL,
    "squareVariationId" text,
    name text NOT NULL,
    price numeric(10,2) NOT NULL,
    "volumeOz" integer,
    "isPublic" boolean DEFAULT true NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WineVariation" OWNER TO postgres;

--
-- Name: WineVariationServingMode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WineVariationServingMode" (
    id text NOT NULL,
    "wineVariationId" text NOT NULL,
    "servingMode" public."ServingMode" DEFAULT 'UNKNOWN'::public."ServingMode" NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WineVariationServingMode" OWNER TO postgres;

--
-- Name: Winery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Winery" (
    id text NOT NULL,
    name text NOT NULL,
    "regionId" text NOT NULL,
    country text NOT NULL,
    website text NOT NULL,
    description text NOT NULL
);


ALTER TABLE public."Winery" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: FlightWine FlightWine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FlightWine"
    ADD CONSTRAINT "FlightWine_pkey" PRIMARY KEY (id);


--
-- Name: Flight Flight_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Flight"
    ADD CONSTRAINT "Flight_pkey" PRIMARY KEY (id);


--
-- Name: Inventory Inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY (id);


--
-- Name: Rating Rating_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_pkey" PRIMARY KEY (id);


--
-- Name: Region Region_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Region"
    ADD CONSTRAINT "Region_pkey" PRIMARY KEY (id);


--
-- Name: SquareCatalogItem SquareCatalogItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SquareCatalogItem"
    ADD CONSTRAINT "SquareCatalogItem_pkey" PRIMARY KEY (id);


--
-- Name: SquareCatalogVariation SquareCatalogVariation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SquareCatalogVariation"
    ADD CONSTRAINT "SquareCatalogVariation_pkey" PRIMARY KEY (id);


--
-- Name: SquareServingModeOverride SquareServingModeOverride_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SquareServingModeOverride"
    ADD CONSTRAINT "SquareServingModeOverride_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WineVariationServingMode WineVariationServingMode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WineVariationServingMode"
    ADD CONSTRAINT "WineVariationServingMode_pkey" PRIMARY KEY (id);


--
-- Name: WineVariation WineVariation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WineVariation"
    ADD CONSTRAINT "WineVariation_pkey" PRIMARY KEY (id);


--
-- Name: Wine Wine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wine"
    ADD CONSTRAINT "Wine_pkey" PRIMARY KEY (id);


--
-- Name: Winery Winery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Winery"
    ADD CONSTRAINT "Winery_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: FlightWine_flightId_position_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FlightWine_flightId_position_idx" ON public."FlightWine" USING btree ("flightId", "position");


--
-- Name: FlightWine_flightId_wineId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FlightWine_flightId_wineId_key" ON public."FlightWine" USING btree ("flightId", "wineId");


--
-- Name: FlightWine_wineId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "FlightWine_wineId_idx" ON public."FlightWine" USING btree ("wineId");


--
-- Name: Flight_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Flight_isActive_idx" ON public."Flight" USING btree ("isActive");


--
-- Name: Inventory_wineId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Inventory_wineId_idx" ON public."Inventory" USING btree ("wineId");


--
-- Name: Inventory_wineId_locationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Inventory_wineId_locationId_key" ON public."Inventory" USING btree ("wineId", "locationId");


--
-- Name: Rating_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Rating_userId_idx" ON public."Rating" USING btree ("userId");


--
-- Name: Rating_wineId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Rating_wineId_idx" ON public."Rating" USING btree ("wineId");


--
-- Name: Region_parentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Region_parentId_idx" ON public."Region" USING btree ("parentId");


--
-- Name: SquareCatalogItem_squareItemId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SquareCatalogItem_squareItemId_key" ON public."SquareCatalogItem" USING btree ("squareItemId");


--
-- Name: SquareCatalogItem_wineId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SquareCatalogItem_wineId_idx" ON public."SquareCatalogItem" USING btree ("wineId");


--
-- Name: SquareCatalogItem_wineId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SquareCatalogItem_wineId_key" ON public."SquareCatalogItem" USING btree ("wineId");


--
-- Name: SquareCatalogVariation_squareCatalogItemId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SquareCatalogVariation_squareCatalogItemId_idx" ON public."SquareCatalogVariation" USING btree ("squareCatalogItemId");


--
-- Name: SquareCatalogVariation_squareVariationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SquareCatalogVariation_squareVariationId_key" ON public."SquareCatalogVariation" USING btree ("squareVariationId");


--
-- Name: SquareCatalogVariation_wineVariationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SquareCatalogVariation_wineVariationId_idx" ON public."SquareCatalogVariation" USING btree ("wineVariationId");


--
-- Name: SquareCatalogVariation_wineVariationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SquareCatalogVariation_wineVariationId_key" ON public."SquareCatalogVariation" USING btree ("wineVariationId");


--
-- Name: SquareServingModeOverride_squareVariationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SquareServingModeOverride_squareVariationId_key" ON public."SquareServingModeOverride" USING btree ("squareVariationId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleSubject_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_googleSubject_key" ON public."User" USING btree ("googleSubject");


--
-- Name: WineVariationServingMode_servingMode_isAvailable_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WineVariationServingMode_servingMode_isAvailable_idx" ON public."WineVariationServingMode" USING btree ("servingMode", "isAvailable");


--
-- Name: WineVariationServingMode_wineVariationId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "WineVariationServingMode_wineVariationId_key" ON public."WineVariationServingMode" USING btree ("wineVariationId");


--
-- Name: WineVariation_squareVariationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WineVariation_squareVariationId_idx" ON public."WineVariation" USING btree ("squareVariationId");


--
-- Name: WineVariation_wineId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WineVariation_wineId_idx" ON public."WineVariation" USING btree ("wineId");


--
-- Name: Wine_name_wineryId_vintage_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Wine_name_wineryId_vintage_key" ON public."Wine" USING btree (name, "wineryId", vintage);


--
-- Name: Wine_regionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Wine_regionId_idx" ON public."Wine" USING btree ("regionId");


--
-- Name: Wine_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Wine_slug_key" ON public."Wine" USING btree (slug);


--
-- Name: Wine_squareItemId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Wine_squareItemId_key" ON public."Wine" USING btree ("squareItemId");


--
-- Name: Wine_wineryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Wine_wineryId_idx" ON public."Wine" USING btree ("wineryId");


--
-- Name: Winery_regionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Winery_regionId_idx" ON public."Winery" USING btree ("regionId");


--
-- Name: FlightWine FlightWine_flightId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FlightWine"
    ADD CONSTRAINT "FlightWine_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES public."Flight"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: FlightWine FlightWine_wineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FlightWine"
    ADD CONSTRAINT "FlightWine_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES public."Wine"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Inventory Inventory_wineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES public."Wine"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Rating Rating_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Rating Rating_wineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rating"
    ADD CONSTRAINT "Rating_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES public."Wine"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Region Region_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Region"
    ADD CONSTRAINT "Region_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Region"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SquareCatalogItem SquareCatalogItem_wineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SquareCatalogItem"
    ADD CONSTRAINT "SquareCatalogItem_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES public."Wine"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SquareCatalogVariation SquareCatalogVariation_squareCatalogItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SquareCatalogVariation"
    ADD CONSTRAINT "SquareCatalogVariation_squareCatalogItemId_fkey" FOREIGN KEY ("squareCatalogItemId") REFERENCES public."SquareCatalogItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SquareCatalogVariation SquareCatalogVariation_wineVariationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SquareCatalogVariation"
    ADD CONSTRAINT "SquareCatalogVariation_wineVariationId_fkey" FOREIGN KEY ("wineVariationId") REFERENCES public."WineVariation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WineVariationServingMode WineVariationServingMode_wineVariationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WineVariationServingMode"
    ADD CONSTRAINT "WineVariationServingMode_wineVariationId_fkey" FOREIGN KEY ("wineVariationId") REFERENCES public."WineVariation"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WineVariation WineVariation_wineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WineVariation"
    ADD CONSTRAINT "WineVariation_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES public."Wine"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wine Wine_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wine"
    ADD CONSTRAINT "Wine_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public."Region"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Wine Wine_wineryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wine"
    ADD CONSTRAINT "Wine_wineryId_fkey" FOREIGN KEY ("wineryId") REFERENCES public."Winery"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Winery Winery_regionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Winery"
    ADD CONSTRAINT "Winery_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES public."Region"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict gt2paxXa3xroEhve0m6IIsK1DdBJNYebhOHM9Zn2LCxfXEb8ULYuNB2jZxpQeG9

