import sys
import os

# Ensure site-packages is in path
appdata = os.environ.get('APPDATA')
site_pkg = os.path.join(appdata, "Python", "Python314", "site-packages") if appdata else ""
if site_pkg and site_pkg not in sys.path:
    sys.path.append(site_pkg)

try:
    from notebooklm_tools.mcp.server import mcp
    print("MCP Loaded")
    # FastMCP stores tools in ._tool_handlers sometimes or just exposes them via list_tools()
    # Let's inspect
    print("TOOLS:", [t.name for t in mcp._tools.values()] if hasattr(mcp, "_tools") else "No _tools")
except Exception as e:
    print("Error:", e)
