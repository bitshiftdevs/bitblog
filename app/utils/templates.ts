// Templates
export const templates = ['cta', 'testimonial', 'productFeature', 'faq', 'pricing']
export const getTemplate = (templateType: string) => {
  let template = ''

  switch (templateType) {
    case 'cta':
      template = `
        <div class="cta-container p-6 bg-primary text-white rounded-lg text-center my-6">
          <h3 class="text-2xl font-bold mb-3">Ready to Get Started?</h3>
          <p class="mb-4">Join thousands of satisfied customers today!</p>
          <a href="#" class="btn bg-white text-primary hover:bg-gray-100">Sign Up Now</a>
        </div>
      `
      break
    case 'testimonial':
      template = `
        <div class="testimonial-container p-6 bg-gray-50 border border-gray-200 rounded-lg my-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
            <div>
              <h4 class="font-bold">Customer Name</h4>
              <p class="text-sm text-gray-600">Position, Company</p>
            </div>
          </div>
          <p class="italic">"This product has completely transformed our workflow. We've seen a 50% increase in productivity since implementation."</p>
        </div>
      `
      break
    case 'productFeature':
      template = `
        <div class="feature-container my-6">
          <div class="flex flex-col md:flex-row">
            <div class="md:w-1/2 p-4">
              <div class="bg-gray-300 rounded-lg h-64 flex items-center justify-center">
                <span class="text-gray-600">Feature Image</span>
              </div>
            </div>
            <div class="md:w-1/2 p-4">
              <h3 class="text-2xl font-bold mb-3">Feature Title</h3>
              <p class="mb-4">Detailed description of the feature and how it benefits the user.</p>
              <ul class="list-disc pl-5 mb-4">
                <li>Benefit one</li>
                <li>Benefit two</li>
                <li>Benefit three</li>
              </ul>
              <a href="#" class="text-primary font-bold">Learn more →</a>
            </div>
          </div>
        </div>
      `
      break
    case 'faq':
      template = `
        <div class="faq-container my-6">
          <h3 class="text-2xl font-bold mb-4">Frequently Asked Questions</h3>

          <div class="space-y-4">
            <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
              <input type="checkbox" />
              <div class="collapse-title text-xl font-medium">
                Question 1?
              </div>
              <div class="collapse-content">
                <p>Answer to question 1. Provide detailed information here.</p>
              </div>
            </div>

            <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
              <input type="checkbox" />
              <div class="collapse-title text-xl font-medium">
                Question 2?
              </div>
              <div class="collapse-content">
                <p>Answer to question 2. Provide detailed information here.</p>
              </div>
            </div>

            <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
              <input type="checkbox" />
              <div class="collapse-title text-xl font-medium">
                Question 3?
              </div>
              <div class="collapse-content">
                <p>Answer to question 3. Provide detailed information here.</p>
              </div>
            </div>
          </div>
        </div>
      `
      break
    case 'pricing':
      template = `
        <div class="pricing-container my-6">
          <h3 class="text-2xl font-bold mb-4 text-center">Pricing Options</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="pricing-card border border-gray-200 rounded-lg p-6 flex flex-col">
              <h4 class="text-xl font-bold mb-2">Basic</h4>
              <div class="text-3xl font-bold mb-2">$19<span class="text-sm font-normal">/month</span></div>
              <p class="text-gray-600 mb-4">Perfect for small businesses</p>
              <ul class="mb-6 flex-1">
                <li class="flex items-center mb-2">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>Feature one</span>
                </li>
                <li class="flex items-center mb-2">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>Feature two</span>
                </li>
                <li class="flex items-center mb-2">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>Feature three</span>
                </li>
              </ul>
              <button class="btn btn-outline w-full">Get Started</button>
            </div>
            <div class="pricing-card border border-primary rounded-lg p-6 flex flex-col">
              <div class="badge badge-primary mb-2">Popular</div>
              <h4 class="text-xl font-bold mb-2">Professional</h4>
              <div class="text-3xl font-bold mb-2">$49<span class="text-sm font-normal">/month</span></div>
              <p class="text-gray-600 mb-4">For growing businesses</p>
              <ul class="mb-6 flex-1">
                <li class="flex items-center mb-2">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>All Basic features</span>
                </li>
                <li class="flex items-center mb-2">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>Pro feature one</span>
                </li>
                <li class="flex items-center mb-2">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>Pro feature two</span>
                </li>
                <li class="flex items-center mb-2">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>Pro feature three</span>
                </li>
              </ul>
              <button class="btn btn-primary w-full">Get Started</button>
            </div>
            <div class="pricing-card border border-gray-200 rounded-lg p-6 flex flex-col">
              <h4 class="text-xl font-bold mb-2">Enterprise</h4>
              <div class="text-3xl font-bold mb-2">$99<span class="text-sm font-normal">/month</span></div>
              <p class="text-gray-600 mb-4">For large organizations</p>
              <ul class="mb-6 flex-1">
                <li class="flex items-center mb-2">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>All Pro features</span>
                </li>
                <li class="flex items-center mb-2">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>Enterprise feature one</span>
                </li>
                <li class="flex items-center mb-2">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>Enterprise feature two</span>
                </li>
                <li class="flex items-center mb-2">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  <span>Priority support</span>
                </li>
              </ul>
              <button class="btn btn-outline w-full">Contact Sales</button>
            </div>
          </div>
        </div>
      `
      break
    default:
      template = ''
  }
  return template
}
