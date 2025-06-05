"use client"

import type React from "react"
import { useState, useEffect } from "react"

// Mock Firebase configuration for development
const mockFirebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "mock-project.firebaseapp.com",
  projectId: "mock-project",
  storageBucket: "mock-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
}

// Mock Firebase functions for development
const mockAuth = {
  currentUser: null,
  signInAnonymously: () =>
    Promise.resolve({ user: { uid: "mock-user-123", email: null, displayName: "Usuário Anônimo" } }),
  signInWithEmailAndPassword: (email: string, password: string) =>
    Promise.resolve({ user: { uid: "mock-user-" + Date.now(), email, displayName: email.split("@")[0] } }),
  createUserWithEmailAndPassword: (email: string, password: string) =>
    Promise.resolve({ user: { uid: "mock-user-" + Date.now(), email, displayName: email.split("@")[0] } }),
  signInWithPopup: () =>
    Promise.resolve({
      user: { uid: "mock-user-" + Date.now(), email: "user@example.com", displayName: "Usuário Social" },
    }),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: (callback: Function) => {
    // Don't auto-login, let user navigate freely
    setTimeout(() => {
      callback(null) // Start with no user
    }, 100)
    return () => {} // unsubscribe function
  },
}

const mockFirestore = {
  collection: () => ({
    doc: () => ({
      set: () => Promise.resolve(),
      get: () => Promise.resolve({ exists: () => false, data: () => null }),
    }),
    onSnapshot: (callback: Function) => {
      // Simulate initial products
      setTimeout(() => {
        callback({
          docs: [
            {
              id: "1",
              data: () => ({
                name: "Plataforma Tesoura Elétrica Compacta",
                description:
                  "Ideal para ambientes internos e acesso em espaços limitados. Operação silenciosa e sem emissões.",
                image: "/placeholder.svg?height=256&width=400",
                price: "R$ 250/dia",
                createdAt: new Date().toISOString(),
                createdBy: "mock-user-123",
              }),
            },
            {
              id: "2",
              data: () => ({
                name: "Plataforma Articulada 16m Diesel",
                description: "Excelente alcance vertical e horizontal para terrenos irregulares. Robusta e versátil.",
                image: "/placeholder.svg?height=256&width=400",
                price: "R$ 400/dia",
                createdAt: new Date().toISOString(),
                createdBy: "mock-user-123",
              }),
            },
            {
              id: "3",
              data: () => ({
                name: "Plataforma Telescópica 28m",
                description: "Máximo alcance para grandes obras e manutenção de fachadas. Alta capacidade de carga.",
                image: "/placeholder.svg?height=256&width=400",
                price: "R$ 600/dia",
                createdAt: new Date().toISOString(),
                createdBy: "mock-user-123",
              }),
            },
          ],
        })
      }, 500)
      return () => {} // unsubscribe function
    },
    add: () => Promise.resolve({ id: "new-doc-" + Date.now() }),
  }),
  doc: () => ({
    set: () => Promise.resolve(),
    get: () => Promise.resolve({ exists: () => false, data: () => null }),
    delete: () => Promise.resolve(),
  }),
}

// Use mock instances for development
const authInstance = mockAuth
const dbInstance = mockFirestore

// Main App Component
function App() {
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [currentPage, setCurrentPage] = useState("home")

  // Helper function to show a custom modal message
  const showCustomModal = (message: string) => {
    setModalMessage(message)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalMessage("")
  }

  // Firebase Auth State Listener and Initialization
  useEffect(() => {
    const unsubscribe = authInstance.onAuthStateChanged(async (currentUser: any) => {
      if (currentUser) {
        setUser(currentUser)
        setUserId(currentUser.uid)
      } else {
        setUser(null)
        setUserId(null)
      }
      setIsAuthReady(true)
    })

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [])

  const handleLogout = async () => {
    try {
      await authInstance.signOut()
      showCustomModal("Você foi desconectado com sucesso.")
      setCurrentPage("home")
      setUser(null)
      setUserId(null)
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      showCustomModal(`Erro ao fazer logout: ${error}`)
    }
  }

  // Function to scroll to section on home page
  const scrollToSection = (sectionId: string) => {
    if (currentPage !== "home") {
      setCurrentPage("home")
      // Wait for page to render then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const renderPage = () => {
    if (!isAuthReady) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-xl text-gray-700">Carregando...</p>
          </div>
        </div>
      )
    }

    switch (currentPage) {
      case "home":
        return (
          <>
            <Hero setCurrentPage={setCurrentPage} />
            <About />
            <Services />
            <Fleet />
            <Contact showCustomModal={showCustomModal} />
          </>
        )
      case "login":
        return <Login setCurrentPage={setCurrentPage} showCustomModal={showCustomModal} />
      case "register":
        return <Register setCurrentPage={setCurrentPage} showCustomModal={showCustomModal} />
      case "dashboard":
        if (user) {
          return <Dashboard user={user} userId={userId} showCustomModal={showCustomModal} />
        } else {
          showCustomModal("Você precisa estar logado para acessar o painel de produtos.")
          setCurrentPage("login")
          return null
        }
      default:
        return (
          <div className="flex justify-center items-center h-screen">
            <p className="text-xl text-red-700">Página não encontrada.</p>
          </div>
        )
    }
  }

  return (
    <div className="font-sans antialiased text-gray-800 bg-gray-50">
      {/* Custom Modal for alerts */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4 text-blue-700">Aviso!</h3>
            <p className="text-gray-700 mb-6">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <Header
        setCurrentPage={setCurrentPage}
        user={user}
        handleLogout={handleLogout}
        scrollToSection={scrollToSection}
        currentPage={currentPage}
      />
      {renderPage()}
      <Footer />
    </div>
  )
}

// Header Component
const Header = ({ setCurrentPage, user, handleLogout, scrollToSection, currentPage }: any) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-white shadow-md fixed w-full z-40 top-0">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <button onClick={() => setCurrentPage("home")} className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md font-bold text-lg shadow-lg">
            TOTAL AÉREAS
          </div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          <NavLink onClick={() => setCurrentPage("home")}>Início</NavLink>
          <NavLink onClick={() => scrollToSection("about")}>Sobre Nós</NavLink>
          <NavLink onClick={() => scrollToSection("services")}>Serviços</NavLink>
          <NavLink onClick={() => scrollToSection("fleet")}>Produtos</NavLink>
          <NavLink onClick={() => scrollToSection("contact")}>Contato</NavLink>
          {user ? (
            <>
              <NavLink onClick={() => setCurrentPage("dashboard")}>Painel</NavLink>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentPage("login")}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Entrar
              </button>
              <button
                onClick={() => setCurrentPage("register")}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cadastrar
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-800 focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              ></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg py-4">
          <nav className="flex flex-col items-center space-y-4">
            <NavLink
              onClick={() => {
                setCurrentPage("home")
                setIsOpen(false)
              }}
            >
              Início
            </NavLink>
            <NavLink
              onClick={() => {
                scrollToSection("about")
                setIsOpen(false)
              }}
            >
              Sobre Nós
            </NavLink>
            <NavLink
              onClick={() => {
                scrollToSection("services")
                setIsOpen(false)
              }}
            >
              Serviços
            </NavLink>
            <NavLink
              onClick={() => {
                scrollToSection("fleet")
                setIsOpen(false)
              }}
            >
              Produtos
            </NavLink>
            <NavLink
              onClick={() => {
                scrollToSection("contact")
                setIsOpen(false)
              }}
            >
              Contato
            </NavLink>
            {user ? (
              <>
                <NavLink
                  onClick={() => {
                    setCurrentPage("dashboard")
                    setIsOpen(false)
                  }}
                >
                  Painel
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 w-fit"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setCurrentPage("login")
                    setIsOpen(false)
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 w-fit"
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    setCurrentPage("register")
                    setIsOpen(false)
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 w-fit"
                >
                  Cadastrar
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

// Reusable Navigation Link Component
const NavLink = ({ onClick, children }: any) => (
  <button
    onClick={onClick}
    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-lg font-medium transition-colors duration-200 ease-in-out bg-transparent border-none cursor-pointer"
  >
    {children}
  </button>
)

// Hero Section Component
const Hero = ({ setCurrentPage }: any) => {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 h-screen flex items-center justify-center text-center p-4 mt-16 md:mt-20 lg:mt-24">
      {/* Overlay pattern */}
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>

      <div className="relative z-10 text-white max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg animate-fade-in-up">
          Sua Solução em Locação de <span className="text-yellow-400">Plataformas Aéreas</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in delay-200">
          Eleve seus projetos com segurança e eficiência nas alturas!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-10 rounded-full shadow-lg text-lg md:text-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-75"
          >
            Ver Plataformas
          </button>
          <button
            onClick={() => {
              const element = document.getElementById("about")
              if (element) {
                element.scrollIntoView({ behavior: "smooth" })
              }
            }}
            className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-4 px-10 rounded-full shadow-lg text-lg md:text-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-75"
          >
            Saiba Mais
          </button>
        </div>
      </div>
    </section>
  )
}

// About Us Section Component
const About = () => {
  return (
    <section id="about" className="container mx-auto px-4 py-16 md:py-24">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl font-extrabold text-blue-800 mb-6 border-b-4 border-blue-600 pb-2 inline-block">
            Sobre Nós
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4 text-lg">
            A <strong>Total Aéreas</strong> é líder no mercado de locação de plataformas aéreas há mais de 20 anos.
            Nosso compromisso é fornecer equipamentos de alta performance e segurança, garantindo que seus projetos em
            altura sejam executados com máxima eficiência e tranquilidade.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            Contamos com uma frota moderna e diversificada, incluindo plataformas tesouras, articuladas e telescópicas,
            todas revisadas e certificadas para as mais diversas aplicações, desde construções civis a eventos.
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">20+</div>
              <div className="text-sm text-gray-600">Anos de Experiência</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">500+</div>
              <div className="text-sm text-gray-600">Projetos Realizados</div>
            </div>
          </div>
        </div>

        <div className="md:w-1/2">
          <img
            src="/placeholder.svg?height=400&width=600"
            alt="Nossa Equipe Total Aéreas"
            className="w-full h-auto rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-300 ease-in-out"
          />
        </div>
      </div>
    </section>
  )
}

// Services Section Component
const Services = () => {
  const services = [
    {
      title: "Plataformas Tesouras",
      description:
        "Ideais para trabalhos em superfícies niveladas e espaços confinados, com excelente capacidade de carga.",
      icon: "🔧",
      features: ["Altura até 15m", "Capacidade 230kg", "Operação elétrica"],
    },
    {
      title: "Plataformas Articuladas",
      description: "Perfeitas para alcançar locais de difícil acesso, com grande versatilidade em manobras.",
      icon: "🏗️",
      features: ["Altura até 20m", "Alcance 12m", "4x4 disponível"],
    },
    {
      title: "Plataformas Telescópicas",
      description: "Para grandes alturas e alcance horizontal, ideais para obras de grande porte.",
      icon: "🏢",
      features: ["Altura até 40m", "Alcance 22m", "Capacidade 300kg"],
    },
    {
      title: "Suporte Técnico",
      description: "Equipe especializada para manutenção e assistência técnica completa.",
      icon: "🛠️",
      features: ["24h disponível", "Técnicos certificados", "Peças originais"],
    },
  ]

  return (
    <section id="services" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-16 md:py-24">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-extrabold mb-4">Nossos Serviços</h2>
        <p className="text-xl mb-12 opacity-90">Soluções completas para trabalhos em altura</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white text-gray-800 rounded-lg shadow-xl p-6 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-blue-700">{service.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              <ul className="text-xs text-gray-500 space-y-1">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Fleet Section Component
const Fleet = () => {
  const products = [
    {
      name: "Tesoura Elétrica 12m",
      image: "/placeholder.svg?height=256&width=400",
      description: "Ideal para ambientes internos e pisos planos.",
      specs: "12m altura • 230kg • Elétrica",
    },
    {
      name: "Articulada Diesel 16m",
      image: "/placeholder.svg?height=256&width=400",
      description: "Para terrenos irregulares e alto alcance.",
      specs: "16m altura • 12m alcance • Diesel",
    },
    {
      name: "Telescópica 28m",
      image: "/placeholder.svg?height=256&width=400",
      description: "Máximo alcance para grandes projetos.",
      specs: "28m altura • 18m alcance • 300kg",
    },
    {
      name: "Tesoura Compacta 8m",
      image: "/placeholder.svg?height=256&width=400",
      description: "Manobras fáceis em espaços reduzidos.",
      specs: "8m altura • 180kg • Compacta",
    },
  ]

  return (
    <section id="fleet" className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-blue-800 mb-6">Nossa Frota</h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Equipamentos modernos e certificados para garantir a segurança e eficiência do seu projeto.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out group"
          >
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity duration-300"
            />
            <div className="p-6">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">{item.specs}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// Login Component
const Login = ({ setCurrentPage, showCustomModal }: any) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await authInstance.signInWithEmailAndPassword(email, password)
      // Manually update the auth state since we're using mocks
      authInstance.currentUser = result.user
      showCustomModal("Login realizado com sucesso!")
      setCurrentPage("dashboard")
      // Trigger a re-render by updating the parent component
      window.location.reload()
    } catch (error) {
      showCustomModal("Erro ao fazer login. Verifique suas credenciais.")
    }
  }

  const handleSocialLogin = async (provider: string) => {
    try {
      const result = await authInstance.signInWithPopup()
      // Manually update the auth state since we're using mocks
      authInstance.currentUser = result.user
      showCustomModal(`Login com ${provider} realizado com sucesso!`)
      setCurrentPage("dashboard")
      // Trigger a re-render by updating the parent component
      window.location.reload()
    } catch (error) {
      showCustomModal(`Erro ao fazer login com ${provider}.`)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 py-16 px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Bem-vindo de volta!</h2>
          <p className="text-gray-600">Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              placeholder="Sua senha"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            Entrar
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Ou continue com</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleSocialLogin("Google")}
            className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Google
          </button>
          <button
            onClick={() => handleSocialLogin("Facebook")}
            className="flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Facebook
          </button>
        </div>

        <p className="text-center text-gray-600">
          Não tem uma conta?{" "}
          <button onClick={() => setCurrentPage("register")} className="text-blue-600 hover:underline font-semibold">
            Cadastre-se
          </button>
        </p>
      </div>
    </section>
  )
}

// Register Component
const Register = ({ setCurrentPage, showCustomModal }: any) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      showCustomModal("As senhas não coincidem.")
      return
    }

    if (password.length < 6) {
      showCustomModal("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    try {
      const result = await authInstance.createUserWithEmailAndPassword(email, password)
      // Manually update the auth state since we're using mocks
      authInstance.currentUser = result.user
      showCustomModal("Conta criada com sucesso! Você já está logado.")
      setCurrentPage("dashboard")
      // Trigger a re-render by updating the parent component
      window.location.reload()
    } catch (error) {
      showCustomModal("Erro ao criar conta. Tente novamente.")
    }
  }

  const handleSocialRegister = async (provider: string) => {
    try {
      const result = await authInstance.signInWithPopup()
      // Manually update the auth state since we're using mocks
      authInstance.currentUser = result.user
      showCustomModal(`Conta criada com ${provider} com sucesso!`)
      setCurrentPage("dashboard")
      // Trigger a re-render by updating the parent component
      window.location.reload()
    } catch (error) {
      showCustomModal(`Erro ao criar conta com ${provider}.`)
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-700 py-16 px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Criar Conta</h2>
          <p className="text-gray-600">Junte-se à Total Aéreas hoje mesmo</p>
        </div>

        <form onSubmit={handleEmailRegister} className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
            <input
              type="password"
              placeholder="Confirme sua senha"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105"
          >
            Criar Conta
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Ou cadastre-se com</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleSocialRegister("Google")}
            className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Google
          </button>
          <button
            onClick={() => handleSocialRegister("Facebook")}
            className="flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Facebook
          </button>
        </div>

        <p className="text-center text-gray-600">
          Já tem uma conta?{" "}
          <button onClick={() => setCurrentPage("login")} className="text-purple-600 hover:underline font-semibold">
            Fazer login
          </button>
        </p>
      </div>
    </section>
  )
}

// Dashboard Component
const Dashboard = ({ user, userId, showCustomModal }: any) => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newProductName, setNewProductName] = useState("")
  const [newProductDescription, setNewProductDescription] = useState("")
  const [newProductImage, setNewProductImage] = useState("")
  const [newProductPrice, setNewProductPrice] = useState("")

  useEffect(() => {
    const unsubscribe = dbInstance.collection().onSnapshot((snapshot: any) => {
      const fetchedProducts = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setProducts(fetchedProducts)
      setLoading(false)
    })

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [user])

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProductName || !newProductDescription || !newProductImage) {
      showCustomModal("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    try {
      const newProduct = {
        name: newProductName,
        description: newProductDescription,
        image: newProductImage,
        price: newProductPrice || "A consultar",
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      }

      setProducts((prev) => [...prev, { id: Date.now().toString(), ...newProduct }])
      showCustomModal("Produto adicionado com sucesso!")

      // Reset form
      setNewProductName("")
      setNewProductDescription("")
      setNewProductImage("")
      setNewProductPrice("")
    } catch (error) {
      showCustomModal("Erro ao adicionar produto.")
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      showCustomModal("Produto excluído com sucesso!")
    } catch (error) {
      showCustomModal("Erro ao excluir produto.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4 mt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen bg-gray-100 py-16 px-4 mt-20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-blue-800 mb-4">Painel de Controle</h2>
          <p className="text-xl text-gray-700">
            Bem-vindo,{" "}
            <span className="font-semibold text-blue-600">{user?.displayName || user?.email || "Usuário"}</span>!
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 inline-block">
            <p className="text-sm text-blue-700">
              <strong>Modo Demo</strong> - ID: {userId}
            </p>
          </div>
        </div>

        {/* Add New Product Form */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-blue-700 mb-6">Adicionar Nova Plataforma</h3>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nome da Plataforma <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ex: Tesoura Elétrica 12m"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Preço por Dia</label>
              <input
                type="text"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ex: R$ 250/dia"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y"
                placeholder="Descreva as características e aplicações da plataforma..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                URL da Imagem <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={newProductImage}
                onChange={(e) => setNewProductImage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="/placeholder.svg?height=256&width=400"
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-center">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                Adicionar Plataforma
              </button>
            </div>
          </form>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out group relative"
            >
              <img
                src={product.image || "/placeholder.svg?height=256&width=400"}
                alt={product.name}
                className="w-full h-64 object-cover group-hover:opacity-90 transition-opacity duration-300"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-blue-700 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-green-600">{product.price}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <button
                  onClick={() =>
                    showCustomModal(
                      `Orçamento solicitado para "${product.name}". Nossa equipe entrará em contato em breve!`,
                    )
                  }
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105 mb-2"
                >
                  Solicitar Orçamento
                </button>

                {product.createdBy === user.uid && (
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors duration-200"
                    title="Excluir produto"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto cadastrado ainda.</p>
            <p className="text-gray-400">Use o formulário acima para adicionar sua primeira plataforma.</p>
          </div>
        )}
      </div>
    </section>
  )
}

// Contact Section Component
const Contact = ({ showCustomModal }: any) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      showCustomModal("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    showCustomModal("Mensagem enviada com sucesso! Entraremos em contato em breve.")
    setFormData({ name: "", email: "", phone: "", message: "" })
  }

  return (
    <section id="contact" className="bg-gray-100 px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-blue-800 mb-4">Entre em Contato</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Estamos prontos para atender você. Solicite um orçamento personalizado para seu projeto.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Form */}
          <div className="lg:w-1/2 bg-white rounded-lg shadow-xl p-8">
            <h3 className="text-2xl font-bold text-blue-700 mb-6">Solicitar Orçamento</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Mensagem <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Descreva seu projeto e necessidades..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                Enviar Solicitação
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="lg:w-1/2 space-y-8">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h3 className="text-2xl font-bold text-blue-700 mb-6">Informações de Contato</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-500 text-xl">📍</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Endereço</h4>
                    <p className="text-gray-600">
                      Rua das Plataformas, 456
                      <br />
                      Industrial, São Paulo - SP
                      <br />
                      CEP: 01234-567
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-blue-500 text-xl">📞</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Telefone</h4>
                    <p className="text-gray-600">(11) 3456-7890</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-blue-500 text-xl">✉️</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">E-mail</h4>
                    <p className="text-gray-600">contato@totalaereas.com.br</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-blue-500 text-xl">🕒</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Horário de Funcionamento</h4>
                    <p className="text-gray-600">
                      Segunda a Sexta: 08:00 - 18:00
                      <br />
                      Sábado: 08:00 - 12:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 text-white rounded-lg shadow-xl p-8">
              <h3 className="text-xl font-bold mb-4">Atendimento 24h</h3>
              <p className="mb-4">Para emergências e suporte técnico, nossa equipe está disponível 24 horas por dia.</p>
              <p className="text-yellow-300 font-semibold">📱 (11) 99999-9999</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white px-4 py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md font-bold text-xl mb-4 inline-block">
              TOTAL AÉREAS
            </div>
            <p className="text-gray-300 mb-4">
              Líder no mercado de locação de plataformas aéreas há mais de 20 anos. Segurança, qualidade e eficiência
              para seus projetos em altura.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                LinkedIn
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Serviços</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Plataformas Tesouras</li>
              <li>Plataformas Articuladas</li>
              <li>Plataformas Telescópicas</li>
              <li>Suporte Técnico</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-gray-300">
              <li>(11) 3456-7890</li>
              <li>contato@totalaereas.com.br</li>
              <li>São Paulo - SP</li>
              <li>Atendimento 24h</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} Total Aéreas. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default App
