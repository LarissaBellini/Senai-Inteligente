"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout, Menu, Dropdown } from "antd";

import HomeOutlined from "@ant-design/icons/es/icons/HomeOutlined";
import CodeSandboxOutlined from "@ant-design/icons/es/icons/CodeSandboxOutlined";
import AppstoreOutlined from "@ant-design/icons/es/icons/AppstoreOutlined";
import DropboxOutlined from "@ant-design/icons/es/icons/DropboxOutlined";
import UserOutlined from "@ant-design/icons/es/icons/UserOutlined";
import DownOutlined from "@ant-design/icons/es/icons/DownOutlined";
import InfoCircleOutlined from "@ant-design/icons/es/icons/InfoCircleOutlined";
import LogoutOutlined from "@ant-design/icons/es/icons/LogoutOutlined";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();


  return (
    <html lang="pt-br">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Layout style={{ minHeight: "100vh", background: "#F6F0E8" }}>
          
          <Layout.Sider
            width={260}
            className="sider-custom"
            style={{
              height: "100vh",
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 1000,
            }}
          >
            <div>
              <div className="logo">
                <h1>SENA<span>i</span></h1>
                <p>Educação forte, </p>
                <p>País forte</p>
              </div>

              <Menu
                mode="inline"
                className="menu-custom"
                items={[
                  {
                    key: "1",
                    icon: <HomeOutlined />,
                    label: <Link href="/">Início</Link>,
                  },
                  {
                    key: "2",
                    icon: <DropboxOutlined />, 
                    label: <Link href="/Elementos">Elementos</Link>,
                  },
                  {
                    key: "3",
                    icon: <CodeSandboxOutlined />,
                    label: <Link href="/TresD">Sala em 3D</Link>,
                  },
                  {
                    key: "4",
                    icon: <AppstoreOutlined />, 
                    label: <Link href="/DoisD">Sala em 2D</Link>,
                  },
                  {
                    key: "5",
                    icon: <InfoCircleOutlined />, 
                    label: <Link href="/Creditos">Sobre</Link>,
                  },
                ]}
              />
            </div>

            {/* <div className="footer-sidebar">
              <Dropdown
                menu={{ items: profileMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <div className="perfil-container" style={{ cursor: "pointer" }}>
                  <div className="perfil-info">
                    <UserOutlined className="perfil-avatar" />
                    <div className="perfil-texto">
                      <strong>Olá, Aluno!</strong>
                      <span>Almoxarife</span>
                    </div>
                  </div>
                  <DownOutlined className="perfil-arrow" />
                </div>
              </Dropdown>
            </div> */}
          </Layout.Sider>

          <Layout style={{ marginLeft: 260, background: "#F6F0E8" }}>
            <Layout.Content style={{ padding: "50px 60px", minHeight: "100vh" }}>
              {children}
            </Layout.Content>
          </Layout>

        </Layout>
      </body>
    </html>
  );
}