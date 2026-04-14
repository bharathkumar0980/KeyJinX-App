const $ = (id) => document.getElementById(id);

// --- 1. CORE API INTEGRATION ---
async function fetchMainframeData() {
  const token = localStorage.getItem("keyjinx_token");
  if (!token) return (window.location.href = "/login.html");

  const startTime = Date.now();

  try {
    const statRes = await fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (statRes.status === 401 || statRes.status === 403) {
      console.warn("Session expired or access denied.");
      localStorage.removeItem("keyjinx_token");
      return (window.location.href = "/login.html");
    }

    const data = await statRes.json();

    if (!data.success || !data.stats) {
      console.error(
        "Mainframe Backend Error:",
        data.message || "Unknown Error",
      );
      $("statusText").innerText = "API ERROR";
      $("statusDot").classList.add("offline");
      return;
    }

    const latency = Date.now() - startTime;

    // Populate Real Numbers
    $("mOnline").innerText = data.stats.onlineUsers;
    $("mTotalUsers").innerText = data.stats.totalUsers;
    $("mVault").innerText = data.stats.totalPasswords;
    $("mLatency").innerHTML =
      `${latency} <span style="font-size:13px;">ms</span>`;

    // Populate REAL Server Memory
    const realMem = data.stats.serverMem || 0;
    $("memBar").style.width = realMem + "%";
    $("memVal").textContent = realMem + "%";
    $("memBar").style.boxShadow = `0 0 10px rgb(var(--jinx-purple-rgb))`;

    // Populate REAL CPU
    const realCpu = data.stats.serverCpu || 0;
    $("cpuBar").style.width = realCpu + "%";
    $("cpuVal").textContent = realCpu + "%";
    $("cpuBar").style.background =
      realCpu > 80 ? "rgb(var(--jinx-pink-rgb))" : "rgb(var(--jinx-cyan-rgb))";

    // Populate Forensic Storage Breakdown
    if ($("mTotalSize")) {
      const totalParts = (data.stats.totalLogicalSize || "0 B").split(" ");
      $("mTotalSize").innerHTML =
        `${totalParts[0]} <span style="font-size: 11px">${totalParts[1] || "B"}</span>`;

      $("mDataSize").innerText = data.stats.dataSize || "0 B";
      $("mIndexSize").innerText = data.stats.indexSize || "0 B";
      $("mStorageSize").innerText = data.stats.storageSize || "0 B";
    }

    // Populate Threat Mitigation
    if (data.stats.totalIntrusions !== undefined) {
      $("mIntru").innerText = data.stats.totalIntrusions;
      $("mIntruNew").innerText = data.stats.recentIntrusions;

      const fwBadge = $("fwBadge");
      fwBadge.innerText = data.stats.firewallStatus;

      if (data.stats.firewallStatus === "LOCKDOWN") {
        fwBadge.className = "badge badge-pink";
        $("fwSub").innerText = "Under active attack!";
        $("fwSub").style.color = "var(--jinx-pink)";
      } else {
        fwBadge.className = "badge badge-cyan";
        $("fwSub").innerText = "Normal operations";
        $("fwSub").style.color = "var(--color-text-tertiary)";
      }
    }

    // Database Status Check
    if (data.stats.dbStatus === "Operational") {
      $("statusText").innerText = "MAINFRAME ONLINE";
      $("statusText").style.color = "var(--jinx-cyan)";
      $("statusDot").classList.remove("offline");
    } else {
      $("statusText").innerText = "DB DISCONNECTED";
      $("statusDot").classList.add("offline");
    }

    fetchMessages(token);
  } catch (error) {
    console.error("Mainframe API Critical Error:", error);
  }
}

// --- 2. MESSAGES API ---
async function fetchMessages(token) {
  try {
    const res = await fetch("/api/admin/messages", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const messages = await res.json();
    window.keyjinxMessages = messages;
    renderMessages(messages);
  } catch (err) {
    console.error("Failed to fetch transmissions");
  }
}

function renderMessages(messages) {
  const tbody = $("inboxBody");
  tbody.innerHTML = "";

  if (messages.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" style="text-align:center; padding: 20px;">No pending transmissions.</td></tr>';
    return;
  }

  messages.forEach((m, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--jinx-cyan);">${m.email}</td>
      <td style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${m.message.substring(0, 35)}…</td>
      <td style="display:flex;gap:4px;padding:10px 6px; justify-content:flex-end;">
          <button class="btn-sm" onclick="openKeyjinxMsg(${index})">INSPECT</button>
          <button class="btn-sm danger" onclick="purgeMessage('${m._id}')">PURGE</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.purgeMessage = async function (msgId) {
  if (!confirm("Permanently wipe this transmission from the server?")) return;

  const token = localStorage.getItem("keyjinx_token");
  const res = await fetch(`/api/admin/messages/${msgId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    fetchMainframeData();
    setTimeout(fetchLogs, 500);
  }
};

window.openKeyjinxMsg = function (index) {
  const m = window.keyjinxMessages[index];
  $("modalFrom").textContent = "ORIGIN: " + m.email;
  $("modalTime").textContent =
    "LOGGED: " + new Date(m.createdAt).toLocaleString();
  $("modalBody").textContent = m.message;
  $("msgModal").style.display = "flex";
};

window.closeModal = function () {
  $("msgModal").style.display = "none";
};

window.logout = function () {
  localStorage.removeItem("keyjinx_token");
  sessionStorage.removeItem("keyjinx_vault_key");
  window.location.href = "/login.html";
};

// --- 3. LOGS SYSTEM ---
async function fetchLogs() {
  const token = localStorage.getItem("keyjinx_token");
  try {
    const res = await fetch("/api/admin/logs", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const logs = await res.json();

    $("logBox").innerHTML = "";

    logs.reverse().forEach((log) => {
      const ts = new Date(log.createdAt).toUTCString().slice(17, 25);
      const line = document.createElement("div");
      line.className = "log-line";
      line.innerHTML = `<span class="ts">[${ts}]</span><span class="ev-${log.type}">[${log.code}]</span> <span style="color:var(--color-text-secondary);">${log.message}</span>`;
      $("logBox").prepend(line);
    });
  } catch (error) {
    console.error("Error fetching logs");
  }
}

// --- 4. USER MANAGEMENT API ---
async function fetchUsers() {
  const token = localStorage.getItem("keyjinx_token");
  try {
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    const users = await res.json();
    renderUsers(users);
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

function renderUsers(users) {
  const tbody = $("usersBody");
  tbody.innerHTML = "";

  users.forEach((u) => {
    const isAdmin = u.role === "The Admin";
    let badgeClass = "badge-cyan";
    if (isAdmin) badgeClass = "badge-pink";
    else if (u.role === "Leecher") badgeClass = "badge-purple";

    let actionBtn = "";
    if (isAdmin) {
      actionBtn = `<button class="btn-sm danger" onclick="updateUserRole('${u._id}', 'Client', '${u.email}')">DEMOTE</button>`;
    } else {
      actionBtn = `<button class="btn-sm danger" style="border-color:var(--jinx-purple-rgb); color:var(--jinx-purple-rgb);" onclick="updateUserRole('${u._id}', 'The Admin', '${u.email}')">PROMOTE</button>`;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-size:10px; opacity:0.6;">${u._id.substring(0, 8)}...</td>
      <td style="color:var(--color-text-primary);">${u.email}</td>
      <td><span class="badge ${badgeClass}">${u.role}</span></td>
      <td style="text-align:right; display:flex; gap:4px; justify-content:flex-end;">
          ${actionBtn}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.updateUserRole = async function (userId, newRole, email) {
  if (
    !confirm(
      `WARNING: Override access clearance for ${email} to [${newRole.toUpperCase()}]?`,
    )
  )
    return;

  const token = localStorage.getItem("keyjinx_token");
  try {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: newRole }),
    });

    const data = await res.json();

    if (res.ok) {
      fetchUsers();
      setTimeout(fetchLogs, 500);
    } else {
      alert(data.message || "Failed to update role.");
    }
  } catch (error) {
    console.error("Error updating role:", error);
  }
};

// --- 5. INITIALIZATION ---
window.onload = () => {
  fetchMainframeData();
  fetchUsers();
  fetchLogs();

  setInterval(() => {
    fetchMainframeData();
    fetchLogs();
  }, 10000);

};
