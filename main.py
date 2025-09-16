#!/usr/bin/env python3
"""
WhatsApp Bot Management System - Launcher
==========================================

Sistema completo de gestão de chatbot do WhatsApp com interface web.
Execute este arquivo para iniciar o sistema completo.

Uso:
    python main.py [--host HOST] [--port PORT] [--public-url URL] [--dev]

Exemplos:
    python main.py                    # Servidor padrão (acesso: http://78.46.250.112/)
    python main.py --port 8080        # Porta customizada
    python main.py --host 78.46.250.112   # Definir IP específico
    python main.py --public-url http://meuservidor.com/   # URL pública personalizada
    python main.py --dev              # Modo desenvolvimento (auto-reload)
"""

import os
import sys
import argparse
import subprocess
import importlib
from pathlib import Path

# Lista de dependências necessárias
REQUIRED_PACKAGES = [
    'fastapi>=0.110.1',
    'uvicorn>=0.25.0',
    'python-dotenv>=1.0.1',
    'pydantic>=2.6.4',
    'python-multipart>=0.0.9'
]

# Configurações padrão que podem ser sobrescritas via variáveis de ambiente
DEFAULT_HOST = os.getenv('WHATSAPP_BOT_HOST', '78.46.250.112')
try:
    DEFAULT_PORT = int(os.getenv('WHATSAPP_BOT_PORT', '8000'))
except ValueError:
    DEFAULT_PORT = 8000
DEFAULT_PUBLIC_URL = os.getenv('WHATSAPP_BOT_PUBLIC_URL', 'http://78.46.250.112/')

def check_and_install_dependencies():
    """Verifica e instala dependências necessárias"""
    print("🔍 Verificando dependências...")
    
    missing_packages = []
    packages_to_check = ['fastapi', 'uvicorn', 'dotenv', 'pydantic']
    
    for pkg_name in packages_to_check:
        try:
            if pkg_name == 'dotenv':
                importlib.import_module('dotenv')
            else:
                importlib.import_module(pkg_name)
            print(f"✅ {pkg_name} já instalado")
        except ImportError:
            missing_packages.append(pkg_name)
            print(f"❌ {pkg_name} não encontrado")
    
    if missing_packages:
        print(f"\n📦 Instalando {len(missing_packages)} pacote(s) faltante(s)...")
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install', '--upgrade'
            ] + REQUIRED_PACKAGES)
            print("✅ Todas as dependências foram instaladas com sucesso!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Erro ao instalar dependências: {e}")
            print("💡 Tente executar manualmente: pip install fastapi uvicorn python-dotenv pydantic python-multipart")
            return False
    else:
        print("✅ Todas as dependências estão instaladas!")
    
    return True

def setup_directories():
    """Cria diretórios necessários se não existirem"""
    dirs_to_create = [
        Path(__file__).parent / "static",
        Path(__file__).parent / "backend",
        Path(__file__).parent / "data"
    ]
    
    for directory in dirs_to_create:
        directory.mkdir(exist_ok=True)
        
def create_data_file():
    """Cria arquivo de dados inicial se não existir"""
    data_file = Path(__file__).parent / "whatsapp_bot_data.json"
    if not data_file.exists():
        import json
        initial_data = {
            "users": [],
            "conversations": {},
            "campaigns": {}
        }
        with open(data_file, 'w', encoding='utf-8') as f:
            json.dump(initial_data, f, indent=2, ensure_ascii=False)
        print("📄 Arquivo de dados inicial criado")

def run_server(host=DEFAULT_HOST, port=DEFAULT_PORT, dev_mode=False, public_url=None):
    """Executa o servidor FastAPI"""
    try:
        import uvicorn
        from backend.server import app

        base_url = (public_url or f"http://{host}:{port}").rstrip('/')

        print(f"""
🚀 Iniciando WhatsApp Bot Management System
══════════════════════════════════════════

📍 URL do sistema: {base_url}/
📖 Documentação da API: {base_url}/docs
🔧 Interface administrativa: {base_url}/redoc

💡 Para parar o servidor, pressione Ctrl+C
        """)
        
        # Configurações do servidor
        config = {
            "app": "backend.server:app",
            "host": host,
            "port": port,
            "log_level": "info"
        }
        
        if dev_mode:
            config.update({
                "reload": True,
                "reload_dirs": ["backend", "static"]
            })
            print("🔄 Modo desenvolvimento ativado (auto-reload)")
        
        uvicorn.run(**config)
        
    except KeyboardInterrupt:
        print("\n\n👋 Sistema encerrado pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro ao iniciar o servidor: {e}")
        print("💡 Verifique se todas as dependências estão instaladas corretamente")
        return False
    
    return True

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description="WhatsApp Bot Management System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:
  python main.py                    # Servidor padrão (acesso: http://78.46.250.112/)
  python main.py --port 8080        # Porta customizada
  python main.py --host 78.46.250.112   # Definir IP específico
  python main.py --public-url http://meuservidor.com/   # URL pública personalizada
  python main.py --dev              # Modo desenvolvimento (auto-reload)
        """
    )

    parser.add_argument(
        '--host',
        default=DEFAULT_HOST,
        help=f'Host do servidor (padrão: {DEFAULT_HOST})'
    )

    parser.add_argument(
        '--port',
        type=int,
        default=DEFAULT_PORT,
        help=f'Porta do servidor (padrão: {DEFAULT_PORT})'
    )
    
    parser.add_argument(
        '--dev',
        action='store_true',
        help='Modo desenvolvimento com auto-reload'
    )
    
    parser.add_argument(
        '--skip-install',
        action='store_true',
        help='Pular verificação e instalação de dependências'
    )

    parser.add_argument(
        '--public-url',
        default=DEFAULT_PUBLIC_URL,
        help=f'URL pública de acesso (padrão: {DEFAULT_PUBLIC_URL})'
    )
    
    args = parser.parse_args()
    
    print("""
██╗    ██╗██╗  ██╗ █████╗ ████████╗███████╗ █████╗ ██████╗ ██████╗     ██████╗  ██████╗ ████████╗
██║    ██║██║  ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗██╔══██╗██╔══██╗    ██╔══██╗██╔═══██╗╚══██╔══╝
██║ █╗ ██║███████║███████║   ██║   ███████╗███████║██████╔╝██████╔╝    ██████╔╝██║   ██║   ██║   
██║███╗██║██╔══██║██╔══██║   ██║   ╚════██║██╔══██║██╔═══╝ ██╔═══╝     ██╔══██╗██║   ██║   ██║   
╚███╔███╔╝██║  ██║██║  ██║   ██║   ███████║██║  ██║██║     ██║         ██████╔╝╚██████╔╝   ██║   
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝         ╚═════╝  ╚═════╝    ╚═╝   
                                                                                                   
                               🤖 Sistema de Gestão de Chatbot WhatsApp 🤖
    """)
    
    # Verificar Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ é necessário. Versão atual:", sys.version)
        return False
    
    # Setup inicial
    setup_directories()
    create_data_file()
    
    # Verificar e instalar dependências
    if not args.skip_install:
        if not check_and_install_dependencies():
            return False
    
    # Executar servidor
    public_url = (args.public_url or '').strip() or None

    return run_server(
        host=args.host,
        port=args.port,
        dev_mode=args.dev,
        public_url=public_url
    )

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
