"use client";

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { Bin } from "../types";

const BinMarker = ({ id, location, status }: Bin) => {
  const icon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: status === "full" ? "red" : "green",
    fillOpacity: 0.8,
    scale: 8,
    strokeColor: "white",
    strokeWeight: 2,
  };

  return <Marker key={id} position={location} icon={icon} />;
};

const Map = () => {
  const [bins, setBins] = useState<Bin[]>([]);

  useEffect(() => {
    const fetchBins = async () => {
      const response = await fetch("/api/bins");
      const data = await response.json();
      setBins(data);
    };
    fetchBins();
  }, []);

  const mapStyles = {
    height: "100vh",
    width: "100%",
  };

  const navbarStyles = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "lightblue",
  };

  const logoStyles = {
    width: "100px",
    height: "50px",
    cursor: "pointer",
  };

  const navLinksStyles = {
    display: "flex",
    gap: "10px",
  };

  const navLinkStyles = {
    textDecoration: "none",
    color: "white",
    fontWeight: "bold",
    fontSize: "18px",
    padding: "10px",
    borderRadius: "5px",
    backgroundColor: "darkblue",
    cursor: "pointer",
  };

  const defaultCenter = {
    lat: 18.795598,
    lng: 98.9510693,
  };

  return (
    <>
      <Head>
        <title>Bin Map</title>
      </Head>
      <nav style={navbarStyles}>
        <Link href="/">
          <Image src="/asset/logo.png" alt="Logo" width={46.5} height={34} />
        </Link>
        <div style={navLinksStyles}>
          <Link href="/about" className="navLinksStyles">
            About
          </Link>
          <Link href="/contact" className="navLinksStyles">
            Contact
          </Link>
        </div>
      </nav>
      <LoadScript
        googleMapsApiKey={
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_DEFAULT_API_KEY"
        }
      >
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={18}
          center={defaultCenter}
        >
          {bins.map((bin) => (
            <BinMarker
              key={bin.id}
              id={bin.id}
              location={bin.location}
              status={bin.status}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </>
  );
};

export default Map;
