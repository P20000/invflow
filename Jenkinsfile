pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22' // Configurable in Jenkins Global Tool Configuration
    }

    environment {
        APP_NAME = 'invflow'
        DOCKER_IMAGE = "invflow:${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing npm dependencies...'
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                echo '🧪 Running unit and integration tests...'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐳 Building Docker image ${DOCKER_IMAGE}..."
                sh "docker build -t ${APP_NAME}:latest -t ${DOCKER_IMAGE} ."
            }
        }

        stage('Deploy (Optional / Staging)') {
            steps {
                echo '🚀 Application ready for deployment!'
                echo "Tag: ${DOCKER_IMAGE}"
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo '✅ Pipeline succeeded! Build artifacts verified.'
        }
        failure {
            echo '❌ Pipeline failed! Check the test/build logs.'
        }
    }
}
