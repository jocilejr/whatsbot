#!/usr/bin/env python3
"""
WhatsApp Bot Management System - Launcher
==========================================

Sistema completo de gestão de chatbot do WhatsApp com interface web.
Execute este arquivo para iniciar o sistema completo.

Uso:
    python main.py [--host HOST] [--port PORT] [--dev]

Exemplos:
    python main.py                    # Servidor padrão (localhost:8000)
    python main.py --port 8080        # Porta customizada
    python main.py --host 0.0.0.0     # Aceitar conexões externas
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

def run_server(host="127.0.0.1", port=8000, dev_mode=False):
    """Executa o servidor FastAPI"""
    try:
        import uvicorn
        from backend.server import app
        
        print(f"""
🚀 Iniciando WhatsApp Bot Management System
══════════════════════════════════════════

📍 URL do sistema: http://{host}:{port}
📖 Documentação da API: http://{host}:{port}/docs
🔧 Interface administrativa: http://{host}:{port}/redoc

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
  python main.py                    # Servidor padrão (localhost:8000)
  python main.py --port 8080        # Porta customizada
  python main.py --host 0.0.0.0     # Aceitar conexões externas
  python main.py --dev              # Modo desenvolvimento (auto-reload)
        """
    )
    
    parser.add_argument(
        '--host', 
        default='127.0.0.1',
        help='Host do servidor (padrão: 127.0.0.1)'
    )
    
    parser.add_argument(
        '--port', 
        type=int, 
        default=8000,
        help='Porta do servidor (padrão: 8000)'
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
    return run_server(args.host, args.port, args.dev)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)