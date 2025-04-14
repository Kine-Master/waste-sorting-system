const apiBase = 'http://localhost:3000/api';

// Enhanced POST function with loading indicators
async function postData(endpoint, data) {
  let formIdPrefix = '';
  if (endpoint === 'sensors') {
    formIdPrefix = 'sensor';
  } else if (endpoint === 'waste-levels') {
    formIdPrefix = 'waste';
  } else if (endpoint === 'bin-status') {
    formIdPrefix = 'bin';
  } else if (endpoint === 'collection-schedule') {
    formIdPrefix = 'schedule';
  }

  const formId = `${formIdPrefix}-form`;
  const form = document.querySelector(`#${formId}`);
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (!form) {
    console.error(`Error: Form with ID '#${formId}' not found.`);
    showAlert('error', 'Form not found. Please check the HTML structure.');
    return; // Exit the function if the form is not found
  }

  if (!submitBtn) {
    console.error(`Error: Submit button not found in form '#${formId}'.`);
    showAlert('error', 'Submit button not found in the form.');
    return; // Exit if the submit button is not found
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const response = await fetch(`${apiBase}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    const result = await response.json();
    console.log(`${endpoint} success:`, result);

    // Show success message and reset form
    showAlert('success', 'Data sent successfully!');
    form.reset();

    return result;
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    showAlert('error', `Failed to send data: ${error.message}`);
    throw error;
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.textContent.replace('Sending...', 'Send');
    }
  }
}

// Show alert messages
function showAlert(type, message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${type}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.classList.add('fade-out');
    setTimeout(() => alertDiv.remove(), 500);
  }, 3000);
}

// Initialize form event listeners with input validation
document.addEventListener('DOMContentLoaded', () => {
  // Sensor Form
  document.getElementById('sensor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      sensor_type: document.getElementById('sensor_type').value.trim(),
      location: document.getElementById('location').value.trim(),
      last_maintenance_date: document.getElementById('last_maintenance_date').value
    };

    if (!formData.sensor_type || !formData.location || !formData.last_maintenance_date) {
      return showAlert('error', 'Please fill all sensor fields');
    }

    await postData('sensors', formData);
  });

  // Waste Level Form
  document.getElementById('waste-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      sensor_id: parseInt(document.getElementById('sensor_id').value),
      waste_level: parseFloat(document.getElementById('waste_level').value)
    };

    if (isNaN(formData.sensor_id) || isNaN(formData.waste_level)) {
      return showAlert('error', 'Please enter valid numbers');
    }

    await postData('waste-levels', formData);
  });

  // Bin Status Form
  document.getElementById('bin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      bin_id: parseInt(document.getElementById('bin_id').value),
      current_status: document.getElementById('current_status').value
    };

    if (isNaN(formData.bin_id)) {
      return showAlert('error', 'Please enter a valid bin ID');
    }

    await postData('bin-status', formData);
  });

  // Collection Schedule Form
  document.getElementById('schedule-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const binIdInput = document.getElementById('sched_bin_id');
    const formData = {
      bin_id: parseInt(binIdInput.value),
      collection_time: document.getElementById('collection_time').value,
      status: document.getElementById('status').value
    };

    if (isNaN(formData.bin_id) || !formData.collection_time) {
      return showAlert('error', 'Please fill all required fields');
    }

    await postData('collection-schedule', formData);
  });
});