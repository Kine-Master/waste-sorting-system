const apiBase = 'http://localhost:3000/api';

async function fetchData(endpoint, containerId, formatter) {
  try {
    const res = await fetch(`${apiBase}/${endpoint}`);
    const data = await res.json();
    document.getElementById(containerId).innerHTML = formatter(data);
  } catch (err) {
    document.getElementById(containerId).innerText = 'Failed to load data.';
    console.error(`Error fetching ${endpoint}:`, err);
  }
}

function formatSensors(data) {
  return '<ul>' + data.map(s => `<li>${s.sensor_type} at ${s.location} (Last maintenance: ${s.last_maintenance_date})</li>`).join('') + '</ul>';
}

function formatWasteLevels(data) {
  return '<ul>' + data.map(w => `<li>Sensor ${w.sensor_id}: ${w.waste_level}% (${new Date(w.timestamp).toLocaleString()})</li>`).join('') + '</ul>';
}

function formatBinStatus(data) {
  return '<ul>' + data.map(b => `<li>${b.bin_name}: ${b.current_status} (Checked: ${new Date(b.last_checked_time).toLocaleString()})</li>`).join('') + '</ul>';
}

function formatSchedule(data) {
  return '<ul>' + data.map(s => `<li>Bin ${s.bin_id}: ${s.status} at ${new Date(s.collection_time).toLocaleString()}</li>`).join('') + '</ul>';
}

function refreshAll() {
  fetchData('sensors', 'sensor-data', formatSensors);
  fetchData('waste-levels', 'waste-levels', formatWasteLevels);
  fetchData('bin-status', 'bin-status', formatBinStatus);
  fetchData('collection-schedule', 'collection-schedule', formatSchedule);
}

// Add refresh buttons
window.addEventListener('DOMContentLoaded', () => {
  const sections = ['sensor', 'levels', 'bin', 'schedule'];
  sections.forEach(id => {
    const button = document.createElement('button');
    button.textContent = 'Refresh';
    button.style.marginLeft = '10px';
    button.addEventListener('click', () => refreshAll());
    document.querySelector(`#${id}-section h2`).appendChild(button);
  });

  refreshAll();
});
