const apiBase = 'http://localhost:3000/api';

// Improved fetch with timeout and better error handling
async function fetchData(endpoint, containerId, formatter) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${apiBase}/${endpoint}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    document.getElementById(containerId).innerHTML = formatter(data);
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    document.getElementById(containerId).innerHTML = `
      <div class="error">
        Failed to load data. ${err.message}
        <button onclick="refreshSection('${endpoint}', '${containerId}')">Retry</button>
      </div>
    `;
  }
}

// Individual refresh functions for each section
function refreshSection(endpoint, containerId) {
  const formatter = {
    'sensors': formatSensors,
    'waste-levels': formatWasteLevels,
    'bin-status': formatBinStatus,
    'collection-schedule': formatSchedule
  }[endpoint];

  fetchData(endpoint, containerId, formatter);
}

// Formatters with null checks
function formatSensors(data) {
  if (!data || !data.length) return '<p>No sensors found</p>';
  return '<ul>' + data.map(s => `
    <li>
      ${s.sensor_type || 'Unknown'} at ${s.location || 'Unknown location'}
      (Last maintenance: ${s.last_maintenance_date ? new Date(s.last_maintenance_date).toLocaleDateString() : 'Never'})
    </li>
  `).join('') + '</ul>';
}

function formatWasteLevels(data) {
  if (!data || !data.length) return '<p>No waste level data</p>';
  return '<ul>' + data.map(w => `
    <li>
      Sensor ${w.sensor_id || 'N/A'}: ${w.waste_level !== null ? w.waste_level + '%' : 'N/A'}
      (${w.timestamp ? new Date(w.timestamp).toLocaleString() : 'Unknown time'})
    </li>
  `).join('') + '</ul>';
}

function formatBinStatus(data) {
  if (!data || !data.length) return '<p>No bin status data</p>';
  return '<ul>' + data.map(b => `
    <li>
      ${b.bin_name || `Bin ${b.bin_id || 'N/A'}`}: ${b.current_status || 'Unknown'}
      (Checked: ${b.last_checked_time ? new Date(b.last_checked_time).toLocaleString() : 'Never'})
    </li>
  `).join('') + '</ul>';
}

function formatSchedule(data) {
  if (!data || !data.length) return '<p>No collection schedules</p>';
  return '<ul>' + data.map(s => `
    <li>
      Bin ${s.bin_id || 'N/A'}: ${s.status || 'Unknown'} at
      ${s.collection_time ? new Date(s.collection_time).toLocaleString() : 'Unknown time'}
    </li>
  `).join('') + '</ul>';
}

// Function to refresh all sections
function refreshAll() {
  refreshSection('sensors', 'sensor-data');
  refreshSection('waste-levels', 'waste-levels');
  refreshSection('bin-status', 'bin-status');
  refreshSection('collection-schedule', 'collection-schedule');
}

// Initialize data loading and set up refresh button event listener
window.addEventListener('DOMContentLoaded', () => {
  // Initial load
  refreshAll();

  // Get the refresh button element
  const refreshButton = document.getElementById('refresh-dashboard-btn');

  // Add event listener to the refresh button
  if (refreshButton) {
    refreshButton.addEventListener('click', refreshAll);
  } else {
    console.warn('Refresh dashboard button not found in the HTML.');
  }
});